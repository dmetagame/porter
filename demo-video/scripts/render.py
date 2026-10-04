import subprocess,sys
subprocess.run(['node_modules/.bin/remotion','render','PorterDemo','output/porter-demo-render.mp4','--codec=h264','--audio-codec=aac','--pixel-format=yuv420p','--crf=20','--concurrency=4',*sys.argv[1:]],check=True)
subprocess.run(['python3','scripts/normalize.py'],check=True)
