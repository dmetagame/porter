import asyncio, json, pathlib, edge_tts, sys

async def main():
    scenes=json.loads(pathlib.Path("scenes.json").read_text())
    for scene in scenes:
        base=pathlib.Path("public/voice")/scene["id"]
        if "--force" not in sys.argv and base.with_suffix(".mp3").exists() and base.with_suffix(".words.json").exists():
            continue
        voice=edge_tts.Communicate(scene["text"], "en-US-GuyNeural", rate="-3%", boundary="WordBoundary")
        subtitles=edge_tts.SubMaker()
        words=[]
        with base.with_suffix(".mp3").open("wb") as audio:
            async for chunk in voice.stream():
                if chunk["type"]=="audio": audio.write(chunk["data"])
                elif chunk["type"]=="WordBoundary":
                    subtitles.feed(chunk)
                    words.append({"text":chunk["text"], "startMs":chunk["offset"]/10000, "endMs":(chunk["offset"]+chunk["duration"])/10000, "timestampMs":None, "confidence":None})
        base.with_suffix(".srt").write_text(subtitles.get_srt().rstrip()+"\n")
        base.with_suffix(".words.json").write_text(json.dumps(words,indent=2)+"\n")
        print("Generated narration:", scene["id"], flush=True)

asyncio.run(main())
