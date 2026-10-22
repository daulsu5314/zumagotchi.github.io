/* 쭈마고치 오프라인 지원 */
const CACHE='zumagotchi-v3';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(url.hostname==='api.open-meteo.com')return;            /* 날씨는 항상 인터넷에서 새로 */
  if(url.origin===location.origin){                          /* 앱 파일: 새 버전이 있으면 받고, 없으면 저장본 */
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  if(url.hostname.endsWith('fonts.googleapis.com')||url.hostname.endsWith('fonts.gstatic.com')){ /* 글꼴은 한 번 받으면 저장 */
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return res})));
  }
});
