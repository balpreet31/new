"""Deterministic migration of researched Probay public content into React data.
Preserves original prose, FAQ answers, tables, pricing and routes; removes legacy
scripts, styling, forms and decorative illustrations in favour of new components.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urljoin,urlsplit
import json,sys,re,hashlib
ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/'research/probay-2026-10-29'
OUT=ROOT/'client/src/data'
def txt(x):return x.get_text(' ',strip=True) if x else ''
def clean(node):
 s=BeautifulSoup(str(node),'html.parser')
 for x in s.select('script,style,iframe,object,embed,form,img'):x.decompose()
 for x in s.find_all(True):
  for key in list(x.attrs):
   if key.startswith('on') or key in ['style','srcdoc']:del x[key]
  if x.name=='a':
   h=x.get('href','')
   if x.has_attr('data-wa'):h='https://wa.me/918447452345?text='+__import__('urllib.parse',fromlist=['quote']).quote(x['data-wa'])
   elif h.startswith('javascript:'):h='#'
   elif h and not h.startswith(('#','http','tel:','mailto:')):h='/'+h
   x['href']=h
   if h.startswith('http'):x['rel']='noopener noreferrer'
  x.attrs={k:v for k,v in x.attrs.items() if k in ['class','id','href','target','rel','open','scope','colspan','rowspan','aria-label','aria-current','data-icon','data-plan']}
 return str(s)
def inner(node):
 return ''.join(str(x) for x in node.contents) if node else ''
data=json.loads((SRC/'inventory.json').read_text(encoding='utf-8'))
pages={}; home={}
for p in data:
 if 'text' not in p or p['url']=='https://probay.in/index.html':continue
 s=BeautifulSoup((SRC/'source'/p['file']).read_text(encoding='utf-8'),'html.parser');m=s.select_one('main');hero=m.select_one('.hero')
 path=urlsplit(p['url']).path; article=m.select_one('article.prose')
 meta=s.find('meta',attrs={'name':'description'});lead=m.select_one('.lead-card');form=m.select_one('form')
 service=form.select_one('input[name=service]') if form else None
 city=form.select_one('select[name=city] option[selected]') if form else None
 h=hero.select_one('h1') if hero else m.select_one('h1')
 breadcrumb=[txt(x) for x in hero.select('.breadcrumb li')] if hero else []
 toc=[{'label':txt(a),'id':a.get('href','').lstrip('#')} for a in m.select('.toc > ul a')]
 info={'path':path,'title':p['title'],'description':meta.get('content','') if meta else '', 'heading':txt(h),'intro':txt(hero.select_one('.hero-lead')) if hero else '', 'eyebrow':txt(hero.select_one('.pill') or hero.select_one('.eyebrow')) if hero else '', 'checks':[txt(x) for x in hero.select('.checks li')] if hero else [], 'price':txt(hero.select_one('.hero-price strong')) if hero else '', 'priceNote':txt(hero.select_one('.hero-price em')) if hero else '', 'hasForm':bool(form),'service':service.get('value','') if service else '', 'city':txt(city) or 'Noida','formHeading':txt(lead.select_one('h2')) if lead else '', 'formIntro':txt(lead.select_one('p')) if lead else '', 'facts':[{'label':txt(x.select_one('small')),'value':txt(x.select_one('strong'))} for x in m.select('.facts .fact')], 'toc':toc,'breadcrumb':breadcrumb, 'articleMeta':txt(hero.select_one('.article-meta')) if hero else '', 'html':clean(inner(article)) if article else '', 'faqCount':len(m.select('.faq-item'))}
 pages[path]=info
 if path=='/':
  home['page']=info
  home['sections']={x['id']:clean(inner(x.select_one('.container') or x)) for x in m.select(':scope > section[id]') if x['id'] in ['compare','calendar']}
  home['faqs']=[{'question':txt(x.select_one('summary')),'answer':clean(inner(x.select_one('.answer')))} for x in m.select('.faq-item')]
  home['services']=[]
  for a in m.select('a.service-card[href]'):
   home['services'].append({'title':txt(a.select_one('h3')),'description':txt(a.select_one('p')),'href':'/'+a['href'],'price':txt(a.select_one('.price strong')) or txt(a.select_one('.price')), 'badge':txt(a.select_one('.tag'))})
  home['steps']=[{'title':txt(x.select_one('h3')),'description':txt(x.select_one('p')),'when':txt(x.select_one('.when'))} for x in m.select('.step')]
  home['plans']=[{'name':txt(x.select_one('h3')),'description':txt(x.select_one('.for')),'amount':txt(x.select_one('.amount')),'note':txt(x.select_one('.plus')),'items':[txt(li) for li in x.select('li')],'featured':'featured' in x.get('class',[])} for x in m.select('.plan')]
  home['locations']=[{'title':txt(x.select_one('h3')),'description':txt(x.select_one('p')),'roc':txt(x.select_one('.roc')),'areas':[txt(z) for z in x.select('.areas span')],'href':'/'+x['href']} for x in m.select('.loc-card')]
  home['guides']=[{'title':txt(x.select_one('h3')),'description':txt(x.select_one('p')),'tag':txt(x.select_one('.guide-tag')),'href':'/'+x['href']} for x in m.select('.guide-card')]
  home['trust']=[{'title':txt(x.select_one('strong')),'description':txt(x.select_one('span'))} for x in m.select('.trust-item')]
 if path=='/cost-calculator.html':
  parsed=BeautifulSoup(info['html'],'html.parser')
  for x in parsed.select('#calc'):x.decompose()
  info['html']=str(parsed)
manifest={'pages':len(pages),'source':'probay.in','sourceDate':'2026-10-29','sourceSha256':hashlib.sha256((SRC/'inventory.json').read_bytes()).hexdigest(),'faqCount':sum(p['faqCount'] for p in pages.values()),'routes':list(pages)}
OUT.mkdir(exist_ok=True,parents=True)
if '--check' in sys.argv:
 saved=json.loads((OUT/'pages.json').read_text(encoding='utf-8'))
 assert saved==pages,'Content drift: rerun migration and inspect changes'
 assert len(pages)==45 and manifest['faqCount']==218
 print('Content verified: all 45 original routes and 218 FAQ entries; source content unchanged.')
else:
 for name,obj in [('pages',pages),('home',home),('migration-manifest',manifest)]:
  (OUT/(name+'.json')).write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf-8')
 content=ROOT/'public/content/pages'
 content.mkdir(parents=True,exist_ok=True)
 for route,info in pages.items():
  (content/('home.json' if route=='/' else route.strip('/').replace('.html','.json'))).write_text(json.dumps(info,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 (OUT/'routes.json').write_text(json.dumps(list(pages)),encoding='utf-8')
 print('Migrated',len(pages),'pages and',manifest['faqCount'],'FAQs')
