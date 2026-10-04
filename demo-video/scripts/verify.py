"""Verify delivered media and timed source; no wallet, RPC, secrets or app writes."""
from pathlib import Path
from datetime import datetime, timezone
import subprocess, json, hashlib, re

def probe(path):
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-count_frames','-of','json',str(path)]))

def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()

root=Path.cwd()
video=root/'output/porter-demo.mp4'
metadata=probe(video)
v=next(s for s in metadata['streams'] if s['codec_type']=='video')
a=next(s for s in metadata['streams'] if s['codec_type']=='audio')
assert v['codec_name']=='h264' and a['codec_name']=='aac'
assert v['width']==1920 and v['height']==1080 and v['pix_fmt']=='yuv420p'
assert v['r_frame_rate']=='30/1' and int(v['nb_read_frames'])==2980
assert abs(float(metadata['format']['duration'])-2980/30)<0.06
assert float(a['duration'])>=98 and abs(float(a['duration'])-float(v['duration']))<0.12
subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(video),'-f','null','-'],check=True,stdout=subprocess.DEVNULL)

timeline=json.loads((root/'src/timeline.json').read_text())
captions=json.loads((root/'src/captions.json').read_text())
proof=json.loads((root.parent/'evidence/mainnet-proof.json').read_text())
assert timeline['durationInFrames']==2980 and sum(s['durationInFrames'] for s in timeline['scenes'])==2980
assert len(captions)==28
last=0
for c in captions:
    assert c['startMs']>=last and c['endMs']>c['startMs'] and c['endMs']<=2980/30*1000
    assert len(c['text'])<=80
    last=c['endMs']
assert any('0.00171944 USDC' in c['text'] for c in captions)
assert proof['gasCostUSDC']=='0.00171944' and proof['senderAlsoSettled'] is True
assert proof['sender']==proof['payee']==proof['caller']
assert proof['payoutBaseUnits']=='100000' and proof['bountyBaseUnits']=='10000'
voice=[]
for scene in timeline['scenes']:
    start=scene['from']/30; end=(scene['from']+scene['durationInFrames'])/30
    audio_path=root/'public/voice'/f'{scene["id"]}.mp3'
    m=probe(audio_path)
    duration=float(m['format']['duration'])
    assert start+scene['audioFrom']/30+duration<=end
    measured=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(audio_path),'-af','astats=metadata=1:reset=0','-f','null','-'],capture_output=True,text=True,check=True)
    peaks=re.findall(r'Peak level dB: (-?[0-9.]+)',measured.stderr)
    rms=re.findall(r'RMS level dB: (-?[0-9.]+)',measured.stderr)
    assert peaks and rms and max(float(p) for p in peaks)<0 and max(float(p) for p in peaks)>-25
    voice.append({'scene':scene['id'],'durationSeconds':duration,'startSeconds':start+scene['audioFrom']/30,'endsBeforeCut':True,'peakDb':float(peaks[-1]),'rmsDb':float(rms[-1])})
# These protected facts/app files must match the starting checkout exactly.
protected=['src/main.tsx','src/styles.css','src/porter-artifact.json','evidence/mainnet-proof.json','evidence/deployment.json','docs/HACKATHON_BLURB.md','docs/OPERATOR.md','contracts/Porter.sol','package.json','package-lock.json']
for name in protected:
    original=subprocess.check_output(['git','show','d2a896cfa67327b0435726cd1980501692889fe7:'+name],cwd=root.parent)
    assert (root.parent/name).read_bytes()==original,name
files=['output/porter-demo.mp4','output/thumbnail.png','output/porter-demo.srt','output/TRANSCRIPT.md']
report={'verifiedAt':datetime.now(timezone.utc).isoformat().replace('+00:00','Z'),'video':{'width':1920,'height':1080,'fps':30,'frames':2980,'durationSeconds':float(metadata['format']['duration']),'codec':'h264','pixelFormat':'yuv420p','audioCodec':'aac','sampleRate':a['sample_rate'],'fullDecode':'passed'},'captionCount':len(captions),'captionAndSceneBounds':'passed','sceneAudio':voice,'protectedFilesByteIdenticalTo':'d2a896cfa67327b0435726cd1980501692889fe7','outputs':{name:{'bytes':(root/name).stat().st_size,'sha256':digest(root/name)}for name in files},'claims':'Existing builder-controlled room only; same sender/payee/caller, no independent use or profit claim.','envRead':False,'walletSigned':False,'contractDeployed':False}
(root/'output/verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
