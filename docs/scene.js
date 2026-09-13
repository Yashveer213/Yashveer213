// A small, real 3D mesh renderer projected to Canvas. No external dependencies.
// Geometry, camera, face sorting, depth and hit tests remain in 3D coordinates.
export function startScene(canvas,onSelect){
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 let width=800,height=480,yaw=-.52,pitch=.48,zoom=1,selected='sentinel',last=0,drag=null,moved=false,frame=0,disposed=false,visible=true;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const stations=[{id:'sentinel',name:'SENTINEL',x:-3.1,z:-1.5},{id:'oops',name:'OOPS!',x:3.1,z:-1.5},{id:'aifi',name:'AI-FI',x:-3.1,z:2.1},{id:'recovery',name:'RECOVERY',x:3.1,z:2.1}];
 let targets=[];
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const faces=[[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]];
 const shades=[.72,.47,.63,.89,1,.48];
 const tint=(hex,k)=>{const n=parseInt(hex.slice(1),16);return `rgb(${[n>>16,(n>>8)&255,n&255].map(v=>Math.round(v*k)).join(',')})`};
 function view(p){const a=p[0]*Math.cos(yaw)-p[2]*Math.sin(yaw),z=p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);return [a,p[1]*Math.cos(pitch)-z*Math.sin(pitch),p[1]*Math.sin(pitch)+z*Math.cos(pitch)];}
 function project(p){const [x,y,z]=view(p),s=Math.min(width/13,height/7.4)*zoom*14/(14+z);return {x:width/2+x*s,y:height*.58-y*s,z};}
 function box(list,x,y,z,w,h,d,color,station){const v=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(a=>[x+a[0]*w/2,y+a[1]*h/2,z+a[2]*d/2]);faces.forEach((f,i)=>list.push({p:f.map(n=>project(v[n])),color:tint(color,shades[i]),station}));}
 function draw(t){if(disposed)return;frame=requestAnimationFrame(draw);if(!visible||(!drag&&t-last<32))return;last=t;ctx.clearRect(0,0,width,height);const mesh=[];
  // Work surface and recessed grid.
  box(mesh,0,-.4,0,9.2,.24,6.7,'#30303c');
  const bob=reduced?0:Math.sin(t*.0012)*.06;
  box(mesh,0,-.05,0,1.6,.28,1.35,'#aa675c');
  box(mesh,0,.36+bob,0,1,.5,.8,'#51494f');
  box(mesh,0,1.24+bob,0,1.7,1.35,1.25,'#8b8287');
  box(mesh,0,1.23+bob,-.644,1.35,.77,.045,'#171c29');
  box(mesh,-.35,1.36+bob,-.684,.22,.16,.045,'#ffad93');
  box(mesh,.35,1.36+bob,-.684,.22,.16,.045,'#ffad93');
  box(mesh,0,1.01+bob,-.683,.29,.045,.045,'#ef917d');
  box(mesh,-.995,1.2+bob,0,.23,.55,.55,'#ec9983');box(mesh,.995,1.2+bob,0,.23,.55,.55,'#ec9983');
  box(mesh,0,2.04+bob,0,.065,.34,.065,'#a0949c');box(mesh,0,2.24+bob,0,.22,.2,.22,'#ffba9c');
  // Four selectable project stations.
  stations.forEach(s=>{const active=s.id===selected;box(mesh,s.x,-.11,s.z,2.03,.35,1.53,active?'#a6685d':'#4e505d',s.id);box(mesh,s.x,.2,s.z,.13,.46,.15,'#737785',s.id);box(mesh,s.x,.83,s.z,1.75,1.04,.14,'#545765',s.id);box(mesh,s.x,.84,s.z-.09,1.53,.83,.035,active?'#e9947f':'#789595',s.id);box(mesh,s.x,.86,s.z-.12,1.19,.04,.022,active?'#542e34':'#28484e',s.id);box(mesh,s.x-.2,.65,s.z-.12,.78,.04,.022,active?'#542e34':'#28484e',s.id);});
  mesh.sort((a,b)=>b.p.reduce((n,p)=>n+p.z,0)-a.p.reduce((n,p)=>n+p.z,0));
  mesh.forEach(f=>{ctx.beginPath();f.p.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle='#13141b88';ctx.lineWidth=.55;ctx.stroke();});
  targets=stations.map(s=>({id:s.id,p:project([s.x,.83,s.z])}));
  stations.forEach(s=>{const p=project([s.x,-.3,s.z-1]);ctx.font='600 10px Arial';ctx.textAlign='center';ctx.fillStyle=s.id===selected?'#ffc3af':'#aeb4c2';ctx.fillText(s.name,p.x,p.y+24);});
 }
 const ro=new ResizeObserver(()=>{const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);});ro.observe(canvas);
 const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting});io.observe(canvas);
 canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};moved=false;canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5)moved=true;yaw+=(e.clientX-drag.x)*.007;pitch=clamp(pitch+(e.clientY-drag.y)*.006,.13,1);drag.x=e.clientX;drag.y=e.clientY;});
 canvas.addEventListener('pointerup',e=>{if(!moved){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const near=targets.map(a=>({...a,d:Math.hypot(a.p.x-x,a.p.y-y)})).sort((a,b)=>a.d-b.d)[0];if(near&&near.d<Math.min(width/8,80))onSelect(near.id);}drag=null;});
 canvas.addEventListener('pointercancel',()=>drag=null);
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')yaw-=.1;if(e.key==='ArrowRight')yaw+=.1;if(e.key==='ArrowUp')pitch=clamp(pitch+.08,.13,1);if(e.key==='ArrowDown')pitch=clamp(pitch-.08,.13,1);if(e.key==='+'||e.key==='=')zoom=clamp(zoom+.1,.65,1.4);if(e.key==='-')zoom=clamp(zoom-.1,.65,1.4);if(e.key==='Home'){yaw=-.52;pitch=.48;zoom=1;}}});
 frame=requestAnimationFrame(draw);
 return{select:id=>selected=id,zoom:n=>zoom=clamp(zoom+n,.65,1.4),reset:()=>{yaw=-.52;pitch=.48;zoom=1},dispose:()=>{disposed=true;cancelAnimationFrame(frame);ro.disconnect();io.disconnect()}};
}
