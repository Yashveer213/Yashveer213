export const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const START='\u2063\u2063',END='\u2064\u2064';
export function hideMessage(cover,message){
 if(!cover.trim()||!message)throw Error('Enter both cover text and a message.');
 if(/[\u200b\u200c\u2063\u2064]/u.test(cover))throw Error('The cover already contains hidden markers. Use fresh cover text.');
 const bytes=new TextEncoder().encode(message);if(bytes.length>1024)throw Error('Use a message of 1,024 UTF-8 bytes or fewer.');
 const checksum=bytes.reduce((a,b)=>(a+b)%256,0),payload=[89,83,bytes.length>>8,bytes.length&255,...bytes,checksum];
 return cover+START+payload.map(b=>b.toString(2).padStart(8,'0').replace(/0/g,'\u200b').replace(/1/g,'\u200c')).join('')+END;
}
export function revealMessage(text){
 const start=text.indexOf(START),end=text.indexOf(END,start+2);if(start<0||end<0)throw Error('No complete lab message found. Some apps remove invisible characters.');
 const raw=text.slice(start+2,end);if(!/^[\u200b\u200c]+$/.test(raw)||raw.length%8||raw.length>8232)throw Error('The hidden payload is malformed.');
 const bits=raw.replace(/\u200b/g,'0').replace(/\u200c/g,'1'),bytes=bits.match(/.{8}/g).map(s=>parseInt(s,2));
 if(bytes[0]!==89||bytes[1]!==83||bytes.length!==5+bytes[2]*256+bytes[3])throw Error('The hidden payload is incomplete.');
 const message=bytes.slice(4,-1);if(message.reduce((a,b)=>(a+b)%256,0)!==bytes.at(-1))throw Error('The hidden payload was changed.');
 try{return new TextDecoder('utf-8',{fatal:true}).decode(new Uint8Array(message));}catch{throw Error('The hidden text is not valid UTF-8.');}
}
export function inspectCode(code){
 if(typeof code!=='string'||code.length>20000)throw Error('Use 20,000 characters or fewer.');
 const rules=[[/\beval\s*\(/,'Dynamic evaluation','Avoid evaluating strings as code.'],[/\.innerHTML\s*=/,'HTML assignment','Review the origin of this value and use textContent for plain text.'],[/\b(?:api_?key|password|secret)\s*[:=]\s*['"][^'"]+['"]/i,'Possible embedded credential','Check whether this is a real secret or a harmless placeholder.'],[/catch\s*(?:\([^)]*\))?\s*\{\s*\}/,'Empty catch','Handle the failure or explain why it is safe to ignore.']];
 return code.split('\n').flatMap((line,i)=>rules.filter(([pattern])=>pattern.test(line)).map(([,title,detail])=>({line:i+1,title,detail})));
}
export function replay(events){return events.map(e=>e.text);}
export const demoInfo=[{id:'unicode',name:'Unicode studio',description:'Hide a message in visible text, then reveal it.',visual:'HELLO → 01001000 → HELLO'},{id:'recovery',name:'Recovery sandbox',description:'Lose the working view. Replay the event log.',visual:'APPEND → LOSE → RESTORE'},{id:'inspector',name:'Pattern inspector',description:'Inspect small code snippets with transparent rules.',visual:'SOURCE → RULES → FINDINGS'}];
export function mountDemo(id,root){
 const info=demoInfo.find(d=>d.id===id);if(!info)throw Error('Unknown playground');
 root.innerHTML=`<article class="playground" id="demo-${id}"><div class="playground-head"><h3>${info.name}</h3><span class="local-tag">RUNS IN YOUR BROWSER</span></div><div id="demo-body"></div></article>`;
 const body=root.querySelector('#demo-body');
 if(id==='unicode'){
 body.innerHTML='<p class="demo-note">This demonstrates hiding, not encryption. Anyone with the decoder can read it. Text stays in this browser tab.</p><div class="demo-form"><label class="field">Visible cover text<input id="cover" value="Build with curiosity." maxlength="2000"></label><label class="field">Hidden message<input id="message" value="You found the quiet corner ✨" maxlength="1024"></label></div><div class="demo-buttons"><button id="hide" class="primary">Hide message</button><button id="reveal" class="secondary">Reveal message</button><button id="copy" class="secondary">Copy carrier</button></div><label class="field">Carrier text — paste a lab message here to decode<textarea id="carrier" rows="3" maxlength="12000"></textarea></label><p id="feedback" class="feedback" role="status">Create a carrier to begin.</p>';
 const get=s=>body.querySelector(s),feedback=get('#feedback');
 function action(fn){try{feedback.classList.remove('error');feedback.textContent=fn();}catch(e){feedback.classList.add('error');feedback.textContent=e.message;}}
 get('#hide').onclick=()=>action(()=>{get('#carrier').value=hideMessage(get('#cover').value,get('#message').value);return `Hidden ${new TextEncoder().encode(get('#message').value).length} UTF-8 bytes. The carrier looks like your cover text.`;});
 get('#reveal').onclick=()=>action(()=>`Revealed: ${revealMessage(get('#carrier').value)}`);
 get('#copy').onclick=async()=>{try{if(!get('#carrier').value)throw Error('Create a carrier first.');await navigator.clipboard.writeText(get('#carrier').value);feedback.textContent='Carrier copied.';feedback.classList.remove('error');}catch{feedback.textContent='Copy unavailable. Select the carrier text and copy it manually.';}};
 }else if(id==='recovery'){
 let events=[],working=[];body.innerHTML='<p class="demo-note">An in-memory simulation of event replay. Reloading this page clears everything; this is not a persistent backup.</p><label class="field">Add an event<input id="event-text" value="Designed a safer restore flow" maxlength="180"></label><div class="demo-buttons"><button id="append" class="primary">Append event</button><button id="lose" class="secondary">Simulate IDE loss</button><button id="restore" class="secondary">Restore from log</button><button id="reset" class="secondary">Reset</button></div><div class="recovery-columns"><div><h4>Immutable event log</h4><ol id="event-log" class="event-list"></ol></div><div><h4>Working view</h4><ol id="working-view" class="event-list"></ol></div></div><p id="feedback" class="feedback" role="status">Add an event to start.</p>';
 const get=s=>body.querySelector(s),draw=()=>{get('#event-log').innerHTML=events.map(e=>`<li><small>EVENT ${e.id}</small> ${escapeHTML(e.text)}</li>`).join('')||'<li>No events yet.</li>';get('#working-view').innerHTML=working.map(t=>`<li>${escapeHTML(t)}</li>`).join('')||'<li>Empty working view.</li>';};
 get('#append').onclick=()=>{const value=get('#event-text').value.trim();if(!value){get('#feedback').textContent='Write an event first.';return;}if(events.length>=50){get('#feedback').textContent='Sandbox limit reached. Reset to start again.';return;}events=[...events,Object.freeze({id:events.length+1,text:value})];working=[...working,value];draw();get('#feedback').textContent='Event appended to the log and working view.';};
 get('#lose').onclick=()=>{working=[];draw();get('#feedback').textContent='Working view cleared. The simulated event log is still intact.';};get('#restore').onclick=()=>{working=replay(events);draw();get('#feedback').textContent=`Restored ${working.length} events from the log.`;};get('#reset').onclick=()=>{events=[];working=[];draw();get('#feedback').textContent='Sandbox reset.';};draw();
 }else{
 body.innerHTML='<p class="demo-note">Four simple pattern checks, inspired by software analysis. This is not the Sentinel engine, an AI model, or a complete security audit. Your code is never executed.</p><label class="field">JavaScript snippet<textarea id="code" rows="7" spellcheck="false" maxlength="20000"></textarea></label><div class="demo-buttons"><button id="inspect" class="primary">Inspect patterns</button><button id="clean" class="secondary">Load cleaner example</button></div><div id="findings" class="demo-output" aria-live="polite">Run the checks to see matched patterns.</div>';
 const code=body.querySelector('#code');code.value='const message = input.value;\npreview.innerHTML = message;\neval(message);\ntry { save(); } catch (error) {}';body.querySelector('#clean').onclick=()=>{code.value='const message = input.value;\npreview.textContent = message;\ntry { save(); } catch (error) {\n  showError(error.message);\n}';body.querySelector('#findings').textContent='Cleaner example loaded. Run the checks again.';};body.querySelector('#inspect').onclick=()=>{const findings=inspectCode(code.value);body.querySelector('#findings').innerHTML=findings.length?`<p>${findings.length} patterns to review</p><ul class="issue-list">${findings.map(f=>`<li><strong>Line ${f.line} · ${f.title}</strong><p>${f.detail}</p></li>`).join('')}</ul>`:'No rule matches. This does not establish that the code is safe or correct.';};
 }
 return {id};
}
