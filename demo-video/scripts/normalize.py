"""Normalize Remotion's JPEG full-range output to standard H.264 4:2:0."""
import subprocess, sys
from pathlib import Path
source=Path(sys.argv[1] if len(sys.argv)>1 else 'output/porter-demo-render.mp4')
target=Path('output/porter-demo.mp4')
assert source.resolve()!=target.resolve()
subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','copy','-movflags','+faststart',str(target)],check=True)
print('Normalized Porter MP4 to limited-range yuv420p/BT.709, with unchanged AAC audio.')
