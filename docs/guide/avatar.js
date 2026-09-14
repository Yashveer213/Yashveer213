import * as THREE from './three.module.min.js';
// Orbit 2: procedural, articulated 3D character. All geometry is authored for this profile.
export function createAvatar(canvas,{onReady=()=>{}}={}){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,40);camera.position.set(0,.3,7.2);camera.lookAt(0,.15,0);
 scene.add(new THREE.HemisphereLight(0xdbe7ff,0x202238,2.5));const key=new THREE.DirectionalLight(0xffd4bc,4.5);key.position.set(3,5,6);scene.add(key);const rim=new THREE.DirectionalLight(0x8dcbff,5);rim.position.set(-4,2,-3);scene.add(rim);
 const mat=(c,m=.25,r=.3)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
 const graphite=mat(0x333a49,.55,.29),ceramic=mat(0xd6c7bf,.32,.26),copper=mat(0xcf8169,.7,.28),dark=mat(0x091423,.3,.22),glow=new THREE.MeshStandardMaterial({color:0xb7f9ec,emissive:0x72ead6,emissiveIntensity:2,roughness:.2}),amber=new THREE.MeshStandardMaterial({color:0xffd3ac,emissive:0xf79567,emissiveIntensity:1.4});
 const rig=new THREE.Group();scene.add(rig);rig.rotation.y=-.18;
 function sphere(parent,x,y,z,sx,sy,sz,material){const o=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
 function box(parent,x,y,z,w,h,d,material){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);parent.add(o);return o;}
 function ring(parent,radius,tube,x,y,z,material){const o=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,12,64),material);o.position.set(x,y,z);parent.add(o);return o;}
 const body=sphere(rig,0,-.53,0,.68,.64,.48,graphite);sphere(rig,0,-.5,.35,.49,.43,.18,ceramic);const core=ring(rig,.17,.038,0,-.5,.53,copper);sphere(rig,0,-.5,.55,.10,.10,.04,glow);ring(rig,.48,.035,0,-.07,0,copper).rotation.x=Math.PI/2;
 const head=new THREE.Group();head.position.y=.8;rig.add(head);
 sphere(head,0,.05,0,1.03,.78,.66,ceramic);sphere(head,0,.025,.43,.89,.49,.37,copper);sphere(head,0,.03,.50,.85,.46,.33,dark);
 const eyes=new THREE.Group();head.add(eyes);const eyeL=sphere(eyes,-.32,.10,.80,.105,.16,.038,glow),eyeR=sphere(eyes,.32,.10,.80,.105,.16,.038,glow);
 const mouth=ring(head,.12,.016,0,-.17,.828,glow);mouth.scale.y=.40;
 for(const side of [-1,1]){const ear=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.17,32),copper);ear.rotation.z=Math.PI/2;ear.position.set(side*1.03,.06,0);head.add(ear);sphere(head,side*1.13,.06,0,.05,.18,.18,graphite);box(head,side*.58,.57,.32,.18,.035,.025,copper);}
 const antenna=box(head,.32,.92,-.08,.035,.42,.035,copper);const beacon=sphere(head,.32,1.15,-.08,.1,.1,.1,amber);
 const arms=[];for(const side of [-1,1]){const a=new THREE.Group();a.position.set(side*.65,-.17,0);rig.add(a);sphere(a,side*.08,-.03,0,.16,.16,.16,copper);const limb=new THREE.Mesh(new THREE.CapsuleGeometry(.10,.35,5,12),graphite);limb.position.set(side*.20,-.25,0);limb.rotation.z=side*.4;a.add(limb);sphere(a,side*.29,-.50,.06,.18,.22,.17,ceramic);box(a,side*.29,-.50,.21,.13,.035,.04,copper);arms.push(a);}
 for(const side of [-1,1])sphere(rig,side*.32,-1.09,.12,.24,.16,.35,graphite);
 const halo=ring(scene,1.39,.012,0,-1.34,0,copper);halo.rotation.x=Math.PI/2;const halo2=ring(scene,1.17,.008,0,-1.33,0,glow);halo2.rotation.x=Math.PI/2;
 let state='idle',pointer={x:0,y:0},last=0,frame,disposed=false,visible=true,yaw=-.18,pitch=0,paused=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const resize=new ResizeObserver(()=>{const {width,height}=canvas.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();});resize.observe(canvas);
 function setPointer(e){const r=canvas.getBoundingClientRect();pointer.x=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/(r.width/2)));pointer.y=Math.max(-1,Math.min(1,(e.clientY-r.top-r.height/2)/(r.height/2)));}
 canvas.addEventListener('pointermove',setPointer);canvas.addEventListener('pointerleave',()=>pointer={x:0,y:0});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;canvas.dispatchEvent(new CustomEvent('avatar-unavailable'));});
 const io=new IntersectionObserver(([e])=>visible=e.isIntersecting);io.observe(canvas);
 function render(t){if(disposed)return;frame=requestAnimationFrame(render);if(!visible||document.hidden||paused||t-last<33)return;last=t;const time=t/1000,move=!reduced.matches;
 rig.position.y=move?Math.sin(time*1.8)*.055:0;rig.rotation.y+=(yaw+pointer.x*.22-rig.rotation.y)*.08;head.rotation.x+=(-pointer.y*.12+pitch-head.rotation.x)*.08;head.rotation.z=state==='curious'?-.14:state==='happy'&&move?Math.sin(time*7)*.055:0;
 const blink=move&&time%5.7>5.52?.12:1;for(const eye of [eyeL,eyeR]){eye.scale.y=.16*blink*(state==='happy'?.65:1);eye.position.y=.10+(state==='reading'?-.045:0);}
 arms[1].rotation.z=state==='wave'?-2.2+(move?Math.sin(time*9)*.22:0):-.12;arms[0].rotation.z=state==='present'?.85:.12;
 glow.emissiveIntensity=state==='thinking'&&move?1.4+Math.sin(time*6)*.7:1.7;beacon.scale.setScalar(state==='thinking'? .11:.1);core.rotation.z=move?time*.35:0;renderer.render(scene,camera);
 }
 frame=requestAnimationFrame(render);onReady();
 return{setState:s=>state=s,orbit:(y,p=0)=>{yaw=y;pitch=p},dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();io.disconnect();scene.traverse(o=>{o.geometry?.dispose();});new Set([graphite,ceramic,copper,dark,glow,amber]).forEach(m=>m.dispose());renderer.dispose();}};
}
