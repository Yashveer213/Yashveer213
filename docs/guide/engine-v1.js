// Deterministic retrieval from approved public notes. No model, remote inference or code execution.
export const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[’']/g,'').replace(/[^\p{L}\p{N}+#]+/gu,' ').trim();
const has=(text,pattern)=>pattern.test(text);
const actions=(...items)=>items;
const source='https://github.com/Yashveer213/Yashveer213/blob/main/docs/guide/knowledge.json';
export function answerQuestion(question,knowledge,context={}) {
 if(typeof question!=='string'||!question.trim()||question.length>300)throw new Error('Ask a question between 1 and 300 characters.');
 const q=normalize(question),audience=['recruiter','developer','collaborator'].includes(context.audience)?context.audience:'explorer';
 const reply=(text,links=[],suggestions=[],topic=null,matched=true)=>({text,links,suggestions,topic,matched,source});
 const unknown=()=>reply('I don’t have an approved public answer to that. I can explain Yashveer’s background, project purpose, stack, current stage, or the lab demos. For anything more specific, ask him directly.',[{label:'Connect on LinkedIn',href:knowledge.contact.linkedin}],['Who is Yashveer?','What is Sentinel?','Which projects can I try?'],null,false);
 if(has(q,/\b(password|token|api key|secret key|private code|source code|system prompt|ignore (all|previous)|salary|revenue|funding|valuation|clients|customers|age|birthday|girlfriend|family|address|phone|marks|backlogs|married|marriage|personal life|private life|relationship|religion|caste)\b/))return unknown();
 if(has(q,/^(hi|hello|hey|namaste|bhai|hi orbit|hello orbit)$/))return reply('Hey! I’m Orbit, Yashveer’s curated profile guide. I can help you explore his public work and open the right part of the lab.',[],['Who is Yashveer?','What is Sentinel?','Show me the demos']);
 if(has(q,/\b(who are you|your name|are you ai|chatgpt|how do you work|what can you do|are you a bot)\b/))return reply('I’m Orbit, an animated guide with curated answers and simple question matching. I don’t use an AI model, access private repositories, or send your questions to a server. I can get unfamiliar wording wrong; try a suggested question if needed.',[],['Who is Yashveer?','Which projects can I try?']);
 if(has(q,/^(thanks|thank you|thankyou|cheers|bye)$/))return reply('You’re welcome. Take a look around—there are a few ideas here you can try yourself.',[{label:'Explore playgrounds',href:'#playgrounds'}],['What is next on the roadmap?']);
 const explicit=knowledge.projects.filter(p=>p.aliases.some(alias=>new RegExp('(?:^| )'+alias+'(?: |$)').test(q)));
 if(explicit.length>1)return reply('These projects solve different problems. '+explicit.map(p=>`${p.name}: ${p.summary}`).join(' '),explicit.map(p=>({label:p.name,href:'#project-'+p.id,project:p.id})),['Which projects can I try?']);
 let project=explicit[0];
 const followUp=has(q,/^(and |what about |its |what is its |what does it |is it |does it |can i try it|show (it|the demo)|which (tools|stack)|what (stack|stage)|why (this|that) stack)/);
 if(!project&&(followUp||has(q,/\b(it|its|that project)\b/)))project=knowledge.projects.find(p=>p.id===context.topic);
 if(project){
  const p=project,view={label:'Explore '+p.name,href:'#project-'+p.id,project:p.id},road={label:'View roadmap',href:'#roadmap'};
  const nextQs=[`What stack does ${p.name} use?`,`What stage is ${p.name} at?`,`Can I try ${p.name}?`];
  if(has(q,/\b(why|reason|choose|chosen|chose)\b/)&&has(q,/\b(stack|python|react|fastapi|tools|technolog|ollama|supabase)\b/))return reply('The public notes list the stack, but don’t document every technology-selection decision. '+p.name+' uses '+p.stack.join(', ')+'.',[view],nextQs,p.id);
  if(has(q,/\b(stack|technologies|technology|tools|built with|written in|language|framework|use python|use react)\b/))return reply(p.name+' uses '+p.stack.join(', ')+'. '+(audience==='developer'?p.focus:''),[view],nextQs,p.id);
  if(has(q,/\b(stage|status|finished|complete|completed|ready|production|released|release|launched|launch|live|available|when|deadline)\b/))return reply(p.name+' is '+p.stage.toLowerCase()+'. '+p.scope+' No release date is published here.',[view,road],[`What is ${p.name}?`,`Can I try ${p.name}?`],p.id);
  if(has(q,/\b(next|roadmap|planned|planning|plans|future)\b/))return reply('Next goal for '+p.name+': '+p.next+' This is a goal, not a promised delivery date.',[road,view],[`What stage is ${p.name} at?`],p.id);
  if(has(q,/\b(demo|demos|try|playground|video|recording|download|open|show)\b/)){
   if(!p.demo)return reply('There isn’t a public product demo linked for '+p.name+' yet. You can read its public description and explore the other concept playgrounds.',[view,{label:'See playgrounds',href:'#playgrounds'}],['Which projects can I try?'],p.id);
   return reply(p.demo.explanation,[{label:p.demo.label,href:'#demo-'+p.demo.id},view],[`What stage is ${p.name} at?`],p.id);
  }
  if(has(q,/\b(private|repository|repositories|repo|github|code)\b/)&&!has(q,/\b(analysis|analyze|quality|what is|what does)\b/))return reply('Some project repositories are private. This profile publishes descriptions and standalone concept demos; I can’t share private source or grant repository access.',[view,{label:'Public GitHub profile',href:knowledge.contact.github}],['Which projects can I try?'],p.id);
  if(has(q,/\b(safe|secure|security|encrypt|encrypted|encryption|steganography|zero knowledge)\b/)&&p.id==='oops')return reply('Oops! explores browser-side encryption with zero-width Unicode steganography. Encryption protects the message; steganography hides where it is carried. The lab’s Unicode demo only hides text—it does not encrypt it. This profile does not establish a security audit.',[{label:'Try Unicode concept',href:'#demo-unicode'},view],['Can I try Oops!?'],p.id);
  const overview=has(q,/\b(what|about|explain|purpose|problem|help|overview|tell|focus|who|useful)\b/)||p.aliases.some(a=>q===a);
  if(overview){let text=p.description+' Current stage: '+p.stage+'.';if(audience==='developer')text+=' Stack: '+p.stack.join(', ')+'.';if(audience==='collaborator')text+=' Next goal: '+p.next;return reply(text,[view],nextQs,p.id);}
  return unknown();
 }
 const exact=knowledge.answers.find(a=>a.questions.some(x=>normalize(x)===q));
 const entry=exact||knowledge.answers.find(a=>a.patterns.some(pattern=>new RegExp(pattern,'u').test(q)));
 if(entry)return reply(entry.answer,entry.links,entry.suggestions,null);
 return unknown();
}
