from pathlib import Path
from bs4 import BeautifulSoup
import urllib.request,urllib.parse,json,re,concurrent.futures
base=Path(__file__).resolve().parent
xml=BeautifulSoup(Path('/tmp/hqc-may-photo-source/dist/sitemap-0.xml').read_text(),'xml')
paths=sorted(set(urllib.parse.urlparse(x.text).path for x in xml.find_all('loc') if not x.text.endswith('.xml')))
def scrape(path):
 res=urllib.request.urlopen('http://127.0.0.1:43918'+path,timeout=20)
 assert urllib.parse.urlparse(res.url).netloc=='127.0.0.1:43918',res.url
 html=res.read().decode();s=BeautifulSoup(html,'html.parser');images=[]
 for el in s.select('img,video[poster],[style*="background"]'):
  src=el.get('src') or el.get('poster')
  if not src:
   match=re.search(r'url\([\'\"]?(.*?)[\'\"]?\)',el.get('style',''));src=match[1] if match else None
  if not src:continue
  section=el.find_parent(['section','article','header','footer'])
  heading=section.find(['h1','h2','h3']) if section else None
  images.append({'src':src,'alt':el.get('alt',''),'section':heading.get_text(' ',strip=True) if heading else ('Footer' if el.find_parent('footer') else 'Page image'),'anchor':section.get('id','') if section else '', 'kind':el.name,'position':len(images)+1})
 return {'path':path,'resolvedPath':urllib.parse.urlparse(res.url).path,'status':res.status,'title':s.title.get_text() if s.title else path,'h1':s.h1.get_text(' ',strip=True) if s.h1 else path,'images':images}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:pages=list(pool.map(scrape,paths))
# Alias URLs must not count as separate placements.
unique={p['resolvedPath']:dict(p,path=p['resolvedPath']) for p in pages}
report={'sourceCommit':'4301fe213d1f9ef90fb1fe106c15821625fd715d','sourceDate':'2026-05-07','deploymentId':'700cf0af-c68e-4059-b144-2b78e5628b41','deploymentStatus':'success','method':'Server-rendered historical production source. Only canonical origin adapted for local reconstruction; external scripts and forms not run.','pages':list(unique.values())}
(base/'evidence/may-pages.json').write_text(json.dumps(report,indent=2))
print({'pages':len(unique),'placements':sum(len(p['images']) for p in unique.values()),'uniqueSources':len(set(i['src'] for p in unique.values() for i in p['images']))})
