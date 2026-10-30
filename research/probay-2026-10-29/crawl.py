import requests, json, time, re
from bs4 import BeautifulSoup
from urllib.parse import urljoin,urlsplit,urldefrag
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).parent
(ROOT/'source').mkdir(exist_ok=True)
BASE='https://probay.in/'
seen=set(); queue=[BASE,BASE+'robots.txt',BASE+'sitemap.xml']; pages=[]; assets=set()
def fetch(url):
    try:
        r=requests.get(url,timeout=35)
        r.encoding='utf-8'
        return url,r.status_code,r.url,r.headers.get('content-type',''),r.text,dict(r.headers)
    except Exception as e: return url,0,url,'',str(e),{}
while queue and len(seen)<150:
    batch=[u for u in queue if u not in seen];queue=[]; seen.update(batch)
    with ThreadPoolExecutor(max_workers=4) as pool:
        results=list(pool.map(fetch,batch))
    for url,status,final,ctype,html,headers in results:
        name=urlsplit(url).path.strip('/').replace('/','__') or 'index-root.html'
        (ROOT/'source'/name).write_text(html,encoding='utf-8')
        p={'url':url,'status':status,'final_url':final,'content_type':ctype,'file':name,'headers':headers}
        if 'html' in ctype:
            s=BeautifulSoup(html,'html.parser')
            p['title']=s.title.get_text(' ',strip=True) if s.title else ''
            p['meta']=[dict(x.attrs) for x in s.select('meta')]
            p['headings']=[{'tag':x.name,'text':x.get_text(' ',strip=True),'id':x.get('id')} for x in s.select('h1,h2,h3,h4')]
            p['links']=[{'text':a.get_text(' ',strip=True) or a.get('aria-label',''),'url':urljoin(final,a.get('href',''))} for a in s.select('a[href]')]
            p['forms']=[{'attrs':dict(f.attrs),'fields':[dict(x.attrs,options=[{'value':o.get('value'),'text':o.get_text(' ',strip=True)} for o in x.select('option')]) for x in f.select('input,select,textarea,button')]} for f in s.select('form')]
            p['images']=[dict(x.attrs) for x in s.select('img')]
            p['scripts']=[dict(x.attrs,inline=x.string or '') for x in s.select('script')]
            p['details']=[x.get_text(' ',strip=True) for x in s.select('details')]
            p['tables']=[[[c.get_text(' ',strip=True) for c in row.select('th,td')] for row in t.select('tr')] for t in s.select('table')]
            for a in p['links']:
                u=urldefrag(a['url'])[0];parts=urlsplit(u)
                if parts.netloc=='probay.in' and parts.scheme in ('https','http') and (parts.path.endswith('.html') or parts.path.endswith('/')) and u not in seen: queue.append(u)
            for x in s.select('script[src],link[href],img[src]'):
                u=urljoin(final,x.get('src') or x.get('href'));parts=urlsplit(u)
                if parts.netloc=='probay.in' and (parts.path.endswith('.js') or parts.path.endswith('.css')): assets.add(u)
            main=s.select_one('main') or s
            for x in main.select('script,style'): x.decompose()
            p['text']=main.get_text('\n',strip=True)
            (ROOT/'source'/(name+'.txt')).write_text(p['text'],encoding='utf-8')
        elif 'xml' in ctype:
            queue += re.findall(r'<loc>(https://probay.in/[^<]+)</loc>',html)
        pages.append(p)
        print(status,url,flush=True)
    queue=list(dict.fromkeys(queue))
for url,status,final,ctype,body,headers in map(fetch,sorted(assets)):
    name=urlsplit(url).path.strip('/').replace('/','__')
    (ROOT/'source'/name).write_text(body,encoding='utf-8')
    print('ASSET',status,url,flush=True)
(ROOT/'inventory.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
print('TOTAL',len(pages),'ASSETS',len(assets),flush=True)
