// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface PorterToken {
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title Porter
/// @notice One-shot scheduled payments. Quantities are ERC-20 base units.
/// @dev Constructor token is immutable. No native sends, sweep, or admin exists.
contract Porter {
    struct Room {
        address sender;
        address payee;
        uint256 payout;
        uint256 bounty;
        uint64 dueAt;
        bool settled;
    }
    PorterToken public immutable usdc;
    uint256 public roomCount;
    uint256 public totalLocked;
    mapping(uint256 => Room) public rooms;
    bool private entering;

    error InvalidToken();
    error InvalidRoom();
    error UnknownRoom();
    error TooEarly(uint64 dueAt);
    error AlreadySettled();
    error AmountMismatch();
    error FundingMismatch();
    error TokenTransferFailed();
    error ReentrantCall();

    event RoomOpened(
        uint256 indexed roomId,
        address indexed sender,
        address indexed payee,
        uint256 payout,
        uint256 bounty,
        uint64 dueAt
    );
    event RoomSettled(
        uint256 indexed roomId, address indexed caller, address indexed payee, uint256 payout, uint256 bounty
    );

    modifier exclusive() {
        if (entering) revert ReentrantCall();
        entering = true;
        _;
        entering = false;
    }

    constructor(address token) {
        if (token.code.length == 0) revert InvalidToken();
        usdc = PorterToken(token);
    }

    /// @notice Approve exactly payout + bounty before opening. Funding is atomic.
    function openRoom(address payee, uint256 payout, uint256 bounty, uint64 dueAt)
        external
        exclusive
        returns (uint256 roomId)
    {
        if (
            payee == address(0) || payee == address(this) || payee == address(usdc) || payout == 0 || bounty == 0
                || dueAt <= block.timestamp
        ) revert InvalidRoom();
        uint256 required = payout + bounty;
        uint256 beforeBalance = usdc.balanceOf(address(this));
        _tokenCall(abi.encodeCall(PorterToken.transferFrom, (msg.sender, address(this), required)));
        if (usdc.balanceOf(address(this)) != beforeBalance + required) revert FundingMismatch();
        roomId = ++roomCount;
        rooms[roomId] = Room(msg.sender, payee, payout, bounty, dueAt, false);
        totalLocked += required;
        emit RoomOpened(roomId, msg.sender, payee, payout, bounty, dueAt);
    }

    /// @notice Amount expectations protect the caller against different terms.
    /// @dev Both transfers succeed together, or the whole transaction rolls back.
    function settle(uint256 roomId, uint256 expectedPayout, uint256 expectedBounty) external exclusive {
        Room storage room = rooms[roomId];
        if (room.sender == address(0)) revert UnknownRoom();
        if (room.settled) revert AlreadySettled();
        if (block.timestamp < room.dueAt) revert TooEarly(room.dueAt);
        if (expectedPayout != room.payout || expectedBounty != room.bounty) revert AmountMismatch();
        room.settled = true;
        totalLocked -= room.payout + room.bounty;
        _tokenCall(abi.encodeCall(PorterToken.transfer, (room.payee, room.payout)));
        _tokenCall(abi.encodeCall(PorterToken.transfer, (msg.sender, room.bounty)));
        emit RoomSettled(roomId, msg.sender, room.payee, room.payout, room.bounty);
    }

    function _tokenCall(bytes memory data) private {
        (bool success, bytes memory result) = address(usdc).call(data);
        if (!success || (result.length != 0 && !abi.decode(result, (bool)))) revert TokenTransferFailed();
    }
}
