import {answerQuestion as original,normalize} from './engine-v1.js';
export {normalize};
const aliases={sentinal:'sentinel',sentinalle:'sentinel',opp:'oops',opps:'oops',aifi:'ai fi'};
export function cleanQuestion(q){let s=normalize(q);for(const [from,to] of Object.entries(aliases))s=s.replace(new RegExp('\\b'+from+'\\b','g'),to);return s.replace(/\btechs?\b/g,'technologies').replace(/\bwhats\b/g,'what is').replace(/\btech stack\b/g,'stack');}
export function answerQuestion(question,k,context={}){
 if(typeof question!=='string'||!question.trim()||question.length>300)throw Error('Ask between 1 and 300 characters.');
 const q=cleanQuestion(question);let base=original(q,k,context);
 if(/\b(tour|walk me through|guide me|show me around)\b/.test(q))return{...base,text:'Choose a short tour. I’ll explain each stop and take you there. You control when to move on.',matched:true,topic:context.topic||null,tours:true,links:[],suggestions:[]};
 if(/\b(remember|talking about|discussing|last project)\b/.test(q))return{...base,matched:true,text:context.topic?'We were exploring '+(k.projects.find(p=>p.id===context.topic)?.name||'your selected project')+'. I can continue with its purpose, stack, stage, or demo.':'We haven’t selected a project yet. Pick one and I’ll remember it during this tab session.',topic:context.topic||null,links:[],suggestions:['What is Sentinel?','What is Oops!?']};
 // Resolve common short follow-ups with the active project; never replace an explicitly named project.
 const explicit=k.projects.some(p=>p.aliases.some(a=>q.includes(a)));
 if(!explicit&&context.topic&&/^(and )?(stack|status|stage|demo|why|next|is it free|how does it work|tell me more|more details)( please)?$/.test(q)){
  const p=k.projects.find(p=>p.id===context.topic);if(p){const prompt=/more|how/.test(q)?'Explain '+p.name:q==='why'?'What problem does '+p.name+' solve?':q+' '+p.name;base=original(prompt,k,context);}
 }
 // Matching failure remains an honest fallback. Offer topic clarification instead of guessing.
 if(!base.matched){const topics=k.projects.filter(p=>p.aliases.some(a=>q.includes(a)));if(topics.length===1){base.topic=topics[0].id;base.suggestions=[`What is ${topics[0].name}?`,`What stack does ${topics[0].name} use?`,`Can I try ${topics[0].name}?`];}}
 base.cards=[];
 const project=k.projects.find(p=>p.id===base.topic);
 if(project&&base.matched)base.cards=[{id:project.id,name:project.name,stage:project.stage,summary:project.summary,stack:project.stack.slice(0,5)}];
 base.sourceIds=project?[project.id]:base.matched?['public-profile']:[];
 return base;
}
export function nextContext(previous,answer,question){return{topic:answer.topic||previous.topic||null,audience:previous.audience||'explorer',interests:[...new Set([...(previous.interests||[]),...(answer.topic?[answer.topic]:[])])].slice(-4),recent:[...(previous.recent||[]),{question:question.slice(0,300),answer:answer.text.slice(0,1200)}].slice(-6)};}
export const tours={
 overview:{title:'Meet the work',steps:[{href:'#lab',title:'Welcome to the workspace',text:'Yashveer’s focus is AI systems, backend engineering, and developer tools. Choose a station to explore a project.'},{href:'#projects',title:'Read the stages',text:'Sentinel is in development. Oops! is built and evolving. AI-Fi is experimental, and recovery is a design. The labels keep goals separate from completed work.'},{href:'#playgrounds',title:'Try the ideas',text:'These browser experiments demonstrate ideas independently. They are not the full project applications.'},{href:'#roadmap',title:'See the next goals',text:'The roadmap describes planned work without promised launch dates.'}]},
 developer:{title:'Developer tour',steps:[{href:'#toolbox',title:'Follow a technology',text:'Use the technology filters to see which projects use a tool.'},{href:'#project-sentinel',project:'sentinel',title:'Sentinel',text:'The public stack includes Python, FastAPI, React, Ollama, and Docker. The focus is analysis workflows and explanations developers can inspect.'},{href:'#demo-inspector',title:'Inspect a snippet',text:'This demo matches four simple patterns. Try a snippet or load the cleaner example. It never executes your code.'},{href:'#journal',title:'Check the public history',text:'This journal tracks human-authored commits in the profile repository, not private product progress.'}]},
 recovery:{title:'Recovery walkthrough',steps:[{href:'#demo-recovery',title:'A small event log',text:'This is an in-memory simulation. Everything resets when you reload. We’ll add an event, lose the working view, then restore it.'},{href:'#demo-recovery',action:'append',title:'1 / Append an event',text:'Click Run this step to add one sample event to the immutable log and working view.'},{href:'#demo-recovery',action:'lose',title:'2 / Simulate IDE loss',text:'Click Run this step to clear the working view. The separate event log remains.'},{href:'#demo-recovery',action:'restore',title:'3 / Replay the log',text:'Click Run this step to rebuild the working view from the log. This explains the idea; it is not persistent backup software.'}]}
};
