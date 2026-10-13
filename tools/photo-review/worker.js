import imageIds from './image-ids.json';
const ids=new Set([...imageIds,...Array.from({length:6},(_,i)=>`hero-${i+1}`)]);
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const secure=response=>{const r=new Response(response.body,response);for(const [k,v] of Object.entries({'X-Robots-Tag':'noindex, nofollow, noarchive, noimageindex','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'self'; img-src 'self' blob:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"}))r.headers.set(k,v);return r;};
async function digest(value){const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(h),n=>n.toString(16).padStart(2,'0')).join('');}
async function body(request){if(Number(request.headers.get('Content-Length')||0)>8192)throw Error('Too large');const t=await request.text();if(t.length>8192)throw Error('Too large');return JSON.parse(t);}
export default {
 async fetch(request,env){
  try{
   const u=new URL(request.url);
   if(u.pathname==='/robots.txt')return secure(new Response('User-agent: *\nDisallow: /\n'));
   if(!['GET','HEAD','POST'].includes(request.method))return secure(json({error:'Method not allowed'},405));
   if(request.method==='POST'&&request.headers.get('Origin')!==u.origin)return secure(json({error:'Origin rejected'},403));
   if(u.pathname==='/api/session'&&request.method==='POST'){
    const {key}=await body(request);if(!env.REVIEW_KEY||typeof key!=='string'||key!==env.REVIEW_KEY)return secure(json({error:'The review link or code is not recognised.'},401));
    const r=json({ok:true});r.headers.set('Set-Cookie',`hqc_review=${await digest(env.REVIEW_KEY)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`);return secure(r);
   }
   const cookies=Object.fromEntries((request.headers.get('Cookie')||'').split(';').map(s=>s.trim().split('=')));
   const authenticated=env.REVIEW_KEY&&cookies.hqc_review===await digest(env.REVIEW_KEY);
   const shell=['/','/index.html','/app.js','/style.css','/favicon.svg'].includes(u.pathname);
   if(!authenticated&&!shell)return secure(json({error:'Open your private review link to continue.'},401));
   if(u.pathname==='/api/review')return secure(await env.REVIEW.get(env.REVIEW.idFromName('pedro-may-2026')).fetch(request));
   if(u.pathname.startsWith('/api/'))return secure(json({error:'Not found'},404));
   if(request.method!=='GET'&&request.method!=='HEAD')return secure(json({error:'Method not allowed'},405));
   return secure(await env.ASSETS.fetch(request));
  }catch{return secure(json({error:'Unable to save right now. Your choices have not been confirmed. Please retry.'},500));}
 }
};
export class PhotoReview {
 constructor(ctx){this.ctx=ctx;}
 async fetch(request){
  if(request.method==='GET')return json(await this.ctx.storage.get('review')||{entries:{},finishedAt:null});
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const op=await body(request);
  return this.ctx.storage.transaction(async storage=>{
   const state=await storage.get('review')||{entries:{},finishedAt:null};
   if(op.action==='finish'){
    if(!Object.values(state.entries).some(e=>e.choice==='keep'||e.choice==='maybe'))return json({error:'Choose at least one favourite or maybe before finishing.'},400);
    state.finishedAt=new Date().toISOString();
   }else{
    if(!ids.has(op.id)||!['','keep','maybe','skip'].includes(op.choice)||typeof op.note!=='string'||op.note.length>2000||!Number.isInteger(op.version))return json({error:'Invalid photo selection'},400);
    const old=state.entries[op.id]||{version:0};
    if(old.version!==op.version)return json({error:'This photo was changed in another tab. Reload to compare before saving.',current:old},409);
    state.entries[op.id]={choice:op.choice,note:op.note,version:old.version+1,updatedAt:new Date().toISOString()};state.finishedAt=null;
   }
   state.updatedAt=new Date().toISOString();await storage.put('review',state);return json(state);
  });
 }
}
