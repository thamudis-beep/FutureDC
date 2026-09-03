/* Natural Earth 110m land → public/img/earth.png, the globe's equirectangular texture. Real geometry, drawn offline.
   npm install --no-save playwright world-atlas@2 topojson-client@3 && node tools/earth-texture.js */
const {chromium}=require('playwright'); const fs=require('fs');
const topo=require('world-atlas/land-110m.json');
const tj=require('topojson-client');
const land=tj.feature(topo,topo.objects.land);
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage();
  await p.setContent('<canvas id=c width=1024 height=512></canvas>');
  const url=await p.evaluate((gj)=>{
    const W=1024,H=512,c=document.getElementById('c'),x=c.getContext('2d');
    x.fillStyle='#0a0e14'; x.fillRect(0,0,W,H);
    const P=([lon,lat])=>[(lon+180)/360*W,(90-lat)/180*H];
    const rings=[]; gj.features.forEach(f=>{const g=f.geometry;(g.type==='Polygon'?[g.coordinates]:g.coordinates).forEach(poly=>poly.forEach(r=>rings.push(r)));});
    /* unwrap each ring past the antimeridian, then draw it at three offsets so the fill
       never has to jump across the canvas — a jump renders as a hairline sliver */
    const unwrapped=rings.map(r=>{ let off=0, prev=null; return r.map(pt=>{ let [px,py]=P(pt);
      if(prev!==null){ if(px-prev>W/2) off-=W; else if(prev-px>W/2) off+=W; } prev=px; return [px+off,py]; }); });
    x.fillStyle='#1c232c';
    [-W,0,W].forEach(dx=>{ x.beginPath();
      unwrapped.forEach(r=>{ r.forEach((q,i)=>{ i?x.lineTo(q[0]+dx,q[1]):x.moveTo(q[0]+dx,q[1]); }); x.closePath(); });
      x.fill('evenodd'); });
    /* coastlines: break the stroke where a ring wraps the antimeridian or runs along the pole */
    x.beginPath();
    [-W,0,W].forEach(dx=>{ unwrapped.forEach(r=>{ let prev=null;
      r.forEach(q=>{ if(prev && !(q[1]>H-2&&prev[1]>H-2)) { x.moveTo(prev[0]+dx,prev[1]); x.lineTo(q[0]+dx,q[1]); } prev=q; }); }); });
    x.strokeStyle='#3a4552'; x.lineWidth=1.1; x.lineCap='round'; x.stroke();
    return c.toDataURL('image/png');
  },land);
  fs.writeFileSync(''+__dirname+'/../public/img/earth.png',Buffer.from(url.split(',')[1],'base64'));
  await b.close(); console.log('earth.png',fs.statSync(''+__dirname+'/../public/img/earth.png').size,'bytes');
})();
