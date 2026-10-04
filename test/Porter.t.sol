// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import {Porter} from "../contracts/Porter.sol";

interface Vm {
    function prank(address) external;
    function startPrank(address) external;
    function stopPrank() external;
    function warp(uint256) external;
    function expectRevert(bytes4) external;
    function expectRevert(bytes calldata) external;
}

contract TestUSDC {
    uint8 public constant decimals = 6;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    address public blocked;
    bool public shortFunding;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function configure(address blocked_, bool short_) external {
        blocked = blocked_;
        shortFunding = short_;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "allowance");
        allowance[from][msg.sender] -= amount;
        require(balanceOf[from] >= amount, "balance");
        balanceOf[from] -= amount;
        balanceOf[to] += shortFunding ? amount - 1 : amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        if (to == blocked) return false;
        require(balanceOf[msg.sender] >= amount, "balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract PorterTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    TestUSDC private token;
    Porter private porter;
    address private constant SENDER = address(0xA11CE);
    address private constant PAYEE = address(0xB0B);
    address private constant CALLER = address(0xCA11);
    uint256 private constant PAYOUT = 100_000;
    uint256 private constant BOUNTY = 10_000;

    function setUp() public {
        token = new TestUSDC();
        porter = new Porter(address(token));
        token.mint(SENDER, 1_000_000);
        vm.warp(1000);
    }

    function open() private returns (uint256 id) {
        vm.startPrank(SENDER);
        token.approve(address(porter), 110_000);
        id = porter.openRoom(PAYEE, PAYOUT, BOUNTY, 1060);
        vm.stopPrank();
    }

    function settle(uint256 id) private {
        vm.prank(CALLER);
        porter.settle(id, PAYOUT, BOUNTY);
    }

    function testExactFundingAndAccounting() public {
        require(open() == 1 && porter.roomCount() == 1);
        require(token.balanceOf(SENDER) == 890_000 && token.balanceOf(address(porter)) == 110_000);
        require(porter.totalLocked() == 110_000 && token.allowance(SENDER, address(porter)) == 0);
    }

    function testEarlySettlementReverts() public {
        uint256 id = open();
        vm.expectRevert(abi.encodeWithSelector(Porter.TooEarly.selector, uint64(1060)));
        settle(id);
        require(porter.totalLocked() == 110_000 && token.balanceOf(PAYEE) == 0);
    }

    function testCallerReceivesBountyAtExactDueTime() public {
        uint256 id = open();
        vm.warp(1060);
        settle(id);
        require(token.balanceOf(PAYEE) == PAYOUT && token.balanceOf(CALLER) == BOUNTY);
        require(token.balanceOf(address(porter)) == 0 && porter.totalLocked() == 0);
        (,,,,, bool paid) = porter.rooms(id);
        require(paid);
    }

    function testDoubleSettlementReverts() public {
        uint256 id = open();
        vm.warp(1060);
        settle(id);
        vm.expectRevert(Porter.AlreadySettled.selector);
        settle(id);
        require(token.balanceOf(CALLER) == BOUNTY);
    }

    function testWrongPayoutReverts() public {
        uint256 id = open();
        vm.warp(1060);
        vm.expectRevert(Porter.AmountMismatch.selector);
        porter.settle(id, PAYOUT + 1, BOUNTY);
        require(porter.totalLocked() == 110_000);
    }

    function testWrongBountyReverts() public {
        uint256 id = open();
        vm.warp(1060);
        vm.expectRevert(Porter.AmountMismatch.selector);
        porter.settle(id, PAYOUT, BOUNTY + 1);
    }

    function testUnknownRoomReverts() public {
        vm.expectRevert(Porter.UnknownRoom.selector);
        porter.settle(99, PAYOUT, BOUNTY);
    }

    function testInsufficientApprovalLeavesNoRoom() public {
        vm.startPrank(SENDER);
        token.approve(address(porter), PAYOUT);
        vm.expectRevert(Porter.TokenTransferFailed.selector);
        porter.openRoom(PAYEE, PAYOUT, BOUNTY, 1060);
        vm.stopPrank();
        require(porter.roomCount() == 0 && token.balanceOf(SENDER) == 1_000_000);
    }

    function testShortFundingRevertsAtomically() public {
        token.configure(address(0), true);
        vm.startPrank(SENDER);
        token.approve(address(porter), 110_000);
        vm.expectRevert(Porter.FundingMismatch.selector);
        porter.openRoom(PAYEE, PAYOUT, BOUNTY, 1060);
        vm.stopPrank();
        require(porter.roomCount() == 0 && token.balanceOf(SENDER) == 1_000_000);
    }

    function testBountyFailureRollsBackPayeeTransfer() public {
        uint256 id = open();
        token.configure(CALLER, false);
        vm.warp(1060);
        vm.expectRevert(Porter.TokenTransferFailed.selector);
        settle(id);
        require(token.balanceOf(PAYEE) == 0 && porter.totalLocked() == 110_000);
        (,,,,, bool paid) = porter.rooms(id);
        require(!paid);
        token.configure(address(0), false);
        settle(id);
        require(token.balanceOf(PAYEE) == PAYOUT);
    }

    function testPayeeFailureKeepsFundsLockedUntilTransferCanSucceed() public {
        uint256 id = open();
        token.configure(PAYEE, false);
        vm.warp(1060);
        for (uint256 attempt; attempt < 2; attempt++) {
            vm.expectRevert(Porter.TokenTransferFailed.selector);
            settle(id);
            require(token.balanceOf(PAYEE) == 0 && token.balanceOf(CALLER) == 0);
            require(token.balanceOf(address(porter)) == 110_000 && porter.totalLocked() == 110_000);
            (,,,,, bool paid) = porter.rooms(id);
            require(!paid);
        }
        token.configure(address(0), false);
        settle(id);
        require(token.balanceOf(PAYEE) == PAYOUT && token.balanceOf(CALLER) == BOUNTY);
        require(porter.totalLocked() == 0);
    }

    function testRoomsCannotSpendEachOthersFunds() public {
        uint256 a = open();
        uint256 b = open();
        vm.warp(1060);
        settle(a);
        require(porter.totalLocked() == 110_000);
        settle(b);
        require(porter.totalLocked() == 0 && token.balanceOf(PAYEE) == 200_000);
    }

    function testRejectsUnsafeRecipients() public {
        vm.expectRevert(Porter.InvalidRoom.selector);
        porter.openRoom(address(porter), PAYOUT, BOUNTY, 1060);
        vm.expectRevert(Porter.InvalidRoom.selector);
        porter.openRoom(address(token), PAYOUT, BOUNTY, 1060);
        vm.expectRevert(Porter.InvalidRoom.selector);
        porter.openRoom(address(0), PAYOUT, BOUNTY, 1060);
    }

    function testRejectsPastDueAndZeroAmounts() public {
        vm.expectRevert(Porter.InvalidRoom.selector);
        porter.openRoom(PAYEE, PAYOUT, BOUNTY, 1000);
        vm.expectRevert(Porter.InvalidRoom.selector);
        porter.openRoom(PAYEE, 0, BOUNTY, 1060);
        vm.expectRevert(Porter.InvalidRoom.selector);
        porter.openRoom(PAYEE, PAYOUT, 0, 1060);
    }

    function testSenderMaySettle() public {
        uint256 id = open();
        vm.warp(1060);
        vm.prank(SENDER);
        porter.settle(id, PAYOUT, BOUNTY);
        require(token.balanceOf(SENDER) == 900_000);
    }

    function testConstructorRejectsNonContractToken() public {
        vm.expectRevert(Porter.InvalidToken.selector);
        new Porter(address(0x123));
    }

    function testFuzzConservation(uint96 p, uint96 b) public {
        uint256 payout = uint256(p) + 1;
        uint256 bounty = uint256(b) + 1;
        token.mint(SENDER, payout + bounty);
        vm.startPrank(SENDER);
        token.approve(address(porter), payout + bounty);
        uint256 id = porter.openRoom(PAYEE, payout, bounty, 1060);
        vm.stopPrank();
        vm.warp(1060);
        vm.prank(CALLER);
        porter.settle(id, payout, bounty);
        require(token.balanceOf(PAYEE) == payout && token.balanceOf(CALLER) == bounty && porter.totalLocked() == 0);
    }
}
