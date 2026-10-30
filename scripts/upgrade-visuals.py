from pathlib import Path
p=Path(__file__).resolve().parent.parent/'client/src/App.jsx'
s=p.read_text(encoding='utf-8')
s=s.replace("import {estimate} from './calculator.js';","import {estimate} from './calculator.js';\nimport {pageVisual,visualAlt,guideVisuals} from './visuals.js';")
s=s.replace('/images/architecture-hero.webp','/images/hero-v2.webp').replace('/images/editorial-desk.webp','/images/advisory-v2.webp')
s=s.replace('<div className="expertise-card-top">','<div className="service-card-image"><img src={`/images/${pageVisual(s.href)}-card.webp`} alt={visualAlt[pageVisual(s.href)]} width="760" height="507" loading="lazy"/></div><div className="expertise-card-top">')
start=s.index('<div className={`city-art city-art-${i}`}')
end=s.index('<div className="city-card-body">',start)
s=s[:start]+'<div className={`city-art city-art-${i}`}><img className="city-photo" src={`/images/city-${["noida","ghaziabad","delhi"][i]}-card.webp`} alt={visualAlt[`city-${["noida","ghaziabad","delhi"][i]}`]} loading="lazy" width="760" height="507"/><span>0{i+1}</span></div>'+s[end:]
start=s.index('<div className={`knowledge-art knowledge-art-${i%3}`}')
end=s.index('<small>{g.tag}',start)
s=s[:start]+'<div className={`knowledge-art knowledge-art-${i%3}`}><img className="guide-photo" src={`/images/${pageVisual(g.href)}-card.webp`} alt={visualAlt[pageVisual(g.href)]} width="760" height="507" loading="lazy"/><span className="knowledge-number">0{i+1}</span><span className="knowledge-art-caption">PROBAY / INSIGHTS</span></div>'+s[end:]
s=s.replace("src={isGuide?'/images/advisory-v2.webp':'/images/hero-v2.webp'} alt={isGuide?'Conceptual editorial document still life':'Contemporary commercial architecture'}","src={`/images/${pageVisual(page.path)}.webp`} alt={visualAlt[pageVisual(page.path)]}")
s=s.replace("gsap.from('[data-hero]',","if(document.querySelector('[data-hero]'))gsap.from('[data-hero]',")
s=s.replace('<Raw html={page.html}/>','<RichArticle page={page}/>')
old="function Raw({html,className=''}){return <div className={`migrated-content ${className}`} dangerouslySetInnerHTML={{__html:html}}/>}"
new="""function Raw({html,className=''}){
 const decorated=html.replace(/(<a\\b[^>]*class=\"[^\"]*guide-card[^\"]*\"[^>]*href=\"([^\"]+)\"[^>]*>)/g,(match,tag,href)=>`${tag}<div class=\"directory-image\"><img src=\"/images/${pageVisual(href)}-card.webp\" alt=\"${visualAlt[pageVisual(href)]||''}\" width=\"760\" height=\"507\" loading=\"lazy\"/></div>`);
 return <div className={`migrated-content ${className}`} dangerouslySetInnerHTML={{__html:decorated}}/>;
}
function RichArticle({page}){
 const excluded=['/privacy-policy.html','/terms.html','/refund-policy.html','/guides.html','/cost-calculator.html','/contact.html'];
 if(excluded.includes(page.path))return <Raw html={page.html}/>;
 const pieces=page.html.split('</section>');
 if(pieces.length<4)return <Raw html={page.html}/>;
 let image=page.hasForm?'guide-documents':'advisory-v2';
 if(page.path.includes('-in-noida'))image='city-noida';
 else if(page.path.includes('-in-ghaziabad'))image='city-ghaziabad';
 else if(page.path.includes('-in-delhi'))image='city-delhi';
 const html=pieces.map((part,i)=>part+(i<pieces.length-1?'</section>':'')+(i===1?`<figure class=\"inline-editorial\"><div class=\"inline-editorial-photo\"><img src=\"/images/${image}.webp\" width=\"1400\" height=\"933\" loading=\"lazy\" alt=\"${visualAlt[image]}\"/></div></figure>`:'')).join('');
 return <Raw html={html}/>;
}"""
assert old in s
s=s.replace(old,new)
p.write_text(s,encoding='utf-8')
print('Integrated service, city and guide photography; updated hero and editorial imagery.')
