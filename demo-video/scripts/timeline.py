"""Build exact 30-fps scene timing and subtitles from TTS word boundaries."""
from pathlib import Path
import json, subprocess, math, re
scenes=json.loads(Path('scenes.json').read_text())
start=0; captions=[]; timeline=[]
for scene in scenes:
    voice=Path('public/voice')/scene['id']
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(voice.with_suffix('.mp3'))]))
    lead=12; tail=30 if scene['id']=='intro' else 24
    if scene['id']=='close': tail=75
    frames=math.ceil(duration*30)+lead+tail
    words=json.loads(voice.with_suffix('.words.json').read_text())
    # Restore script punctuation omitted by the speech service's boundary labels.
    cursor=0
    for w in words:
        pos=scene['text'].lower().find(w['text'].lower(),cursor)
        if pos>=0:
            cursor=pos+len(w['text'])
            while cursor<len(scene['text']) and scene['text'][cursor] in ',.!?;:':
                w['text']+=scene['text'][cursor]; cursor+=1
    merged=[]; i=0
    while i<len(words):
        tokens=[w['text'].strip(',.!?;:').lower() for w in words[i:i+14]]
        if tokens[:10]==['zero','point','zero','zero','one','seven','one','nine','four','four'] and tokens[10:14]==['u','s','d','c']:
            merged.append({**words[i],'text':'0.00171944 USDC'+('.' if words[i+13]['text'].endswith('.') else ''),'endMs':words[i+13]['endMs']}); i+=14
        elif tokens[:4]==['u','s','d','c']:
            merged.append({**words[i],'text':'USDC'+(''.join(c for c in words[i+3]['text'] if c in ',.!?;:')),'endMs':words[i+3]['endMs']}); i+=4
        else:
            merged.append(words[i]); i+=1
    grouped=[]; group=[]
    for word in merged:
        if group and (len(' '.join(w['text'] for w in group)+' '+word['text'])>62 or word['endMs']-group[0]['startMs']>4300):
            grouped.append(group); group=[]
        group.append(word)
        if re.search(r'[.!?]$',word['text']): grouped.append(group); group=[]
    if group: grouped.append(group)
    for group in grouped:
        captions.append({'text':' '.join(w['text'] for w in group),'startMs':round((start+lead)/30*1000+group[0]['startMs']),'endMs':round((start+lead)/30*1000+group[-1]['endMs']+90),'timestampMs':None,'confidence':None})
    timeline.append({**scene,'from':start,'durationInFrames':frames,'audioFrom':lead,'audioDurationSeconds':duration}); start+=frames
for first,second in zip(captions,captions[1:]): first['endMs']=min(first['endMs'],second['startMs']-20)
Path('src/timeline.json').write_text(json.dumps({'fps':30,'durationInFrames':start,'scenes':timeline},indent=2)+'\n')
Path('src/captions.json').write_text(json.dumps(captions,indent=2)+'\n')
def stamp(ms): return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
Path('output/porter-demo.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(c["startMs"])} --> {stamp(c["endMs"])}\n{c["text"]}' for i,c in enumerate(captions))+'\n')
proof=json.loads(Path('../evidence/mainnet-proof.json').read_text())
links='\n\n## Product and existing proof links\n\n- Live app: https://porter-gilt.vercel.app\n- Public source: https://github.com/dmetagame/porter\n- Contract: https://explorer.arc.io/address/'+proof['contract']+'\n- Open: '+proof['openUrl']+'\n- Settle: '+proof['settleUrl']+'\n'
Path('output/TRANSCRIPT.md').write_text('# Porter demo transcript\n\nSynthetic narration: en-US-GuyNeural. Actual live interface and public explorer captures; no wallet signature or new payment.\n\n'+'\n\n'.join(f'## {scene["from"]/30:.2f}s — {scene["id"]}\n\n{scene["text"].replace("U S D C","USDC")}' for scene in timeline)+links)
print(json.dumps({'durationSeconds':start/30,'frames':start,'captions':len(captions)}))
