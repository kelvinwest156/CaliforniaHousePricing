import urllib.request
import re

req = urllib.request.Request("https://lite.duckduckgo.com/lite/", data=b"q=site:youtube.com+luxury+real+estate+enes+yilmazer", headers={"User-Agent": "Mozilla/5.0"})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    vids = re.findall(r'v=([a-zA-Z0-9_-]{11})', html)
    print(list(set(vids))[:3])
except Exception as e:
    print(e)
