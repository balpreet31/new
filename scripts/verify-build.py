from pathlib import Path
from bs4 import BeautifulSoup
import json,requests
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlsplit,urldefrag
ROOT=Path(__file__).resolve().parent.parent
pages=json.loads((ROOT/'client/src/data/pages.json').read_text(encoding='utf8'))
errors=[];soups={};images=set()
for route,page in pages.items():
 file=ROOT/'dist'/('index.html' if route=='/' else route[1:])
 assert file.exists(),route
 s=BeautifulSoup(file.read_text(encoding='utf8'),'html.parser');soups[route]=s
 if s.title.get_text()!=page['title']:errors.append(('title',route))
 if len(s.select('h1'))!=1:errors.append(('h1',route))
 if not s.select_one('#page-data'):errors.append(('data',route))
 for im in s.select('img[src]'):
  u=im['src'];images.add(u)
  if u.startswith('/') and not (ROOT/'dist'/u[1:]).is_file():errors.append(('image',route,u))
for route,s in soups.items():
 for a in s.select('a[href]'):
  href=a['href']
  if href.startswith('#'):
   if not s.find(id=href[1:]) and href!='#':errors.append(('anchor',route,href))
  elif href.startswith('/'):
   target,frag=urldefrag(href);target='/' if target in ['/','/index.html'] else target
   if target not in soups:errors.append(('route',route,href))
   elif frag and not soups[target].find(id=frag):errors.append(('target anchor',route,href))
def check(route):
 r=requests.get('http://127.0.0.1:4173'+route,timeout=20)
 return route,r.status_code
with ThreadPoolExecutor(max_workers=4) as pool:statuses=list(pool.map(check,pages))
for route,status in statuses:
 if status!=200:errors.append(('http',route,status))
unknown=requests.get('http://127.0.0.1:4173/does-not-exist',timeout=10)
if unknown.status_code!=404:errors.append(('404',unknown.status_code))
result={'pages':len(pages),'unique_images_used':len(images),'http200':sum(s==200 for _,s in statuses),'errors':errors}
(ROOT/'qa/build-verification.json').write_text(json.dumps(result,indent=2),encoding='utf8')
print(json.dumps(result,indent=2))
assert not errors,'Build verification failed'
