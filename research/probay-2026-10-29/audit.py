import json,re,csv
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlsplit,urljoin,urldefrag
from concurrent.futures import ThreadPoolExecutor
import requests
P=Path(__file__).parent
data=json.loads((P/'inventory.json').read_text(encoding='utf-8'))
pages=[p for p in data if 'text' in p]
byurl={p['url']:p for p in pages}
soups={p['url']:BeautifulSoup((P/'source'/p['file']).read_text(encoding='utf-8'),'html.parser') for p in pages}
issues=[]; assets=set(); forms=[]; counts={}; schemas={}
for p in pages:
 s=soups[p['url']]
 for a in s.select('a[href]'):
  target,frag=urldefrag(urljoin(p['url'],a['href']))
  if frag and target in soups and not soups[target].find(id=frag): issues.append({'page':p['url'],'text':a.get_text(' ',strip=True),'target':target+'#'+frag,'issue':'missing fragment'})
 for x in s.select('img[src],script[src],link[rel="stylesheet"]'):
  u=urljoin(p['url'],x.get('src') or x.get('href'))
  if urlsplit(u).netloc=='probay.in': assets.add(u)
 for f in p.get('forms',[]):
  forms.append({'page':p['url'],'fields':[{'name':x.get('name'),'type':x.get('type'),'value':x.get('value'),'selected':[o['value'] for o in x.get('options',[]) if False]} for x in f['fields']]})
 for x in s.select('[class]'):
  for c in x.get('class',[]): counts[c]=counts.get(c,0)+1
 schemas[p['url']]=[]
 for x in s.select('script[type="application/ld+json"]'):
  try: schemas[p['url']].append(json.loads(x.string or '{}'))
  except Exception: pass
def check(u):
 try:
  r=requests.get(u,timeout=25); return {'url':u,'status':r.status_code,'bytes':len(r.content),'content_type':r.headers.get('content-type')}
 except Exception as e:return {'url':u,'error':str(e)}
with ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(check,sorted(assets)))
audit={'fragment_issues':issues,'assets':results,'forms':forms,'classes':dict(sorted(counts.items(),key=lambda x:-x[1])),'schemas':schemas}
(P/'audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
with (P/'page-inventory.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.writer(f); w.writerow(['URL','Status','Title','Description','Canonical','H1 count','Forms','FAQs','Main text characters'])
 for p in pages:
  s=soups[p['url']];meta=s.find('meta',attrs={'name':'description'});canonical=s.find('link',rel='canonical')
  w.writerow([p['url'],p['status'],p['title'],meta.get('content') if meta else '',canonical.get('href') if canonical else '',len(s.select('h1')),len(p['forms']),len(p['details']),len(p['text'])])
print(json.dumps({'html_urls':len(pages),'unique_html_files':len(set(p['file'] for p in pages)),'forms':len(forms),'faq_items':sum(len(p['details']) for p in pages),'assets':results,'fragment_issue_count':len(issues),'issues':issues,'schema_types':sorted(set(v.get('@type','') for vals in schemas.values() for v in vals))},ensure_ascii=False,indent=2))
