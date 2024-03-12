from youtube_dl import YoutubeDL
import codecs

# video = "https://www.youtube.com/channel/UCzJLQ8z8wr8PPTkYOjOFRjg"
channel_url = "https://www.youtube.com/channel/UCQ_MqAw18jFTlBB-f8BP7dw"

with codecs.open('videos.tsv', 'a', 'utf-8') as f:
	with YoutubeDL() as ydl:
		info_dict = ydl.extract_info(channel_url, download=False)
		entries = info_dict.get("entries", [])
		if len(entries) == 0:
			exit
		videos = entries[0].get("entries", [])
		for video in videos:
			video_date = video.get("upload_date", None)
			video_id = video.get("id", None)
			video_title = video.get('title', None)
			video_desc = video.get('description', None)
			year = video_date[0:4]
			month = video_date[4:6]
			day = video_date[6:8]
			formatted_date = year + "年" + month + "月" + day + "日"
			line = "\t".join([video_id, formatted_date, video_title, video_desc.replace("\n", "<br>")])
			f.write(line + "\n")
