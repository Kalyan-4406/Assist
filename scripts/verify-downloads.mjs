import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base='https://campus-build-race-nxtwave.vabjashwanthreddy.chatgpt.site';
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const result=[];
for(const file of await fs.readdir('public/submission')){
  const local=await fs.readFile('public/submission/'+file);
  const response=await fetch(base+'/submission/'+file);
  assert.equal(response.status,200,file+' status');
  const remote=Buffer.from(await response.arrayBuffer());
  assert.equal(hash(remote),hash(local),file+' exact file content');
  result.push({file,bytes:remote.length,sha256:hash(remote),status:'PASS'});
}
await fs.writeFile('../deliverables/download-verification.json',JSON.stringify({base,measuredAt:new Date().toISOString(),result},null,2));
const page=await fetch(base+'/c/vnr-vjiet');
const html=await page.text();
assert.equal(page.status,200,'final campus response');
assert.ok(html.split('</head>')[0].includes('name="description"'),'description in final document head');
console.log(JSON.stringify({files:result.length,allMatch:true,headDescription:true}));
