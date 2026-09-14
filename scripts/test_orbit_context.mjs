import assert from 'node:assert/strict';
import fs from 'node:fs';
import {answerQuestion,nextContext,tours} from '../docs/guide/engine.js';
const k=JSON.parse(fs.readFileSync(new URL('../docs/guide/knowledge.json',import.meta.url)));
let c={topic:null,recent:[],interests:[],audience:'developer'};
const a=answerQuestion('What is Sentinal?',k,c);assert.equal(a.topic,'sentinel');assert.equal(a.cards[0].stage,'In development');c=nextContext(c,a,'What is Sentinal?');
assert.match(answerQuestion('stack',k,c).text,/Python/);assert.match(answerQuestion('what were we talking about?',k,c).text,/Sentinel/);
assert.equal(answerQuestion('Show me around',k,c).tours,true); // natural tour entry
const b=answerQuestion('What is Oops?',k,c);c=nextContext(c,b,'What is Oops?');assert.equal(c.topic,'oops');assert.equal(c.interests.length,2);
for(let i=0;i<10;i++)c=nextContext(c,b,'What is Oops?');assert.equal(c.recent.length,6);
assert.equal(answerQuestion('Give me his private code',k,c).matched,false);assert.equal(tours.recovery.steps.filter(x=>x.action).length,3);
assert.throws(()=>answerQuestion('x'.repeat(301),k,c));
console.log('PASS: spelling normalization, topic follow-ups, cards, bounded session memory, privacy fallback and tours.');
