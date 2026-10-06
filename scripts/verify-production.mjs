import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const base='https://campus-build-race-nxtwave.vabjashwanthreddy.chatgpt.site';
const checks=[];const check=(name,ok)=>{assert.ok(ok,name);checks.push({case:name,result:'PASS'})};
const call=async(route,data,cookie)=>{const r=await fetch(base+'/api/'+route,{method:data?'POST':'GET',headers:{...(data?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{})},body:data?JSON.stringify(data):undefined});const type=r.headers.get('content-type')??'';return {status:r.status,body:type.includes('json')?await r.json():await r.text(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:360,height:800}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const route of ['/','/c/vnr-vjiet','/race','/plan','/privacy','/submission','/me/D00000']){const r=await page.goto(base+route);await page.waitForTimeout(500);check('signed-out '+route,r.status()===200&&await page.locator('h1').count()>0);check('360px no overflow '+route,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
check('public pages without runtime errors',errors.length===0);
const vars=await fs.readFile('.dev.vars','utf8');const password=vars.split(/\r?\n/).find(x=>x.startsWith('OPS_PASSWORD='))?.slice(13);
check('unauthenticated ops stats denied',(await call('ops/stats')).status===401);check('unauthenticated CSV denied',(await call('ops/export')).status===401);
const initial=await call('snapshot');const input={name:'Demo Verification',email:`production-check-${Date.now()}@example.invalid`,collegeId:'cbit',branch:'CSE/IT',year:'Final year',interest:'Placements',consent:true,ref:'D00000',angle:'P',session:'production-qa-'+crypto.randomUUID(),website:''};
const created=await call('register',input);check('durable registration and owner session',created.status===200&&!!created.cookie&&created.body.profile.owned);const code=created.body.profile.code;
check('QA registration remains excluded from real outcomes',(await call('snapshot')).body.liveTotal===initial.body.liveTotal);
check('referral write attributed',(await call('me/D00000')).body.referrals>=1);
const duplicate=await call('register',input);check('duplicate email does not reveal original card',duplicate.status===200&&duplicate.body.alreadyRegistered&&!duplicate.body.profile);
check('public code cannot change readiness',(await call('readiness',{code,readiness:{laptop:true,account:true,repo:true}})).status===401);
check('owner can save readiness',(await call('readiness',{code,readiness:{laptop:true,account:true,repo:true}},created.cookie)).status===200);
check('missing timestamp withholds calendar',(await call('calendar')).status===409);
const operator=await call('ops/login',{password});check('operator password works',operator.status===200&&!!operator.cookie);const brief=await call('ops/brief',{},operator.cookie);check('Morning Brief 3 insights and 5 labelled actions',brief.status===200&&brief.body.insights.length===3&&brief.body.actions.length===5&&brief.body.actions.every(a=>a.message.includes('[Simulation: demo data included]')));
const csv=await call('ops/export',undefined,operator.cookie);check('authorised CSV works',csv.status===200&&csv.body.includes('consent_at'));
const hide=await call('ops/demo',{hidden:true},operator.cookie);
try {
  check('global hide switches to true live count',hide.status===200&&hide.body.total===hide.body.liveTotal&&hide.body.hideDemo);
  await page.goto(base+'/c/vnr-vjiet');
  const hiddenCollege=hide.body.colleges.find(c=>c.slug==='vnr-vjiet');
  check('college metadata respects hidden demo records',(await page.locator('meta[name="description"]').last().getAttribute('content')).startsWith(hiddenCollege.total+' from'));
} finally {await call('ops/demo',{hidden:false},operator.cookie);}
for(const route of ['/api/og/vnr-vjiet','/api/card-image/'+code+'?size=portrait','/submission/Growth_Plan.pdf','/submission/AI_Learning_Notes.pdf','/submission/Question_6_Answer.pdf','/submission/Question_6_Answer.md','/submission/Submission_Summary.md','/submission/Video_Script.md','/submission/Outreach_Kit.md','/submission/Final_Audit.md','/submission/Production_Verification.md','/submission/Submission_Checklist.md']){const r=await fetch(base+route);const data=Buffer.from(await r.arrayBuffer());check('public asset '+route,r.status===200&&data.byteLength>400);if(route.startsWith('/api/og/')||route.startsWith('/api/card-image/')){check('PNG signature '+route,data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));const expected=route.startsWith('/api/og/')?[1200,630]:[1080,1350];check('PNG dimensions '+route,data.readUInt32BE(16)===expected[0]&&data.readUInt32BE(20)===expected[1]);}}
if(process.env.VERIFY_VIDEO==='1'){const r=await fetch(base+'/submission/Campus_Build_Race_Demo.mp4');check('video public signed out',r.status===200&&r.headers.get('content-type')?.includes('video/mp4'));await r.body?.cancel();await page.goto(base+'/submission');await page.evaluate(()=>{const video=document.createElement('video');video.src='/submission/Campus_Build_Race_Demo.mp4';video.preload='metadata';document.body.appendChild(video);});await page.waitForFunction(()=>document.querySelector('video')?.readyState>=1);const media=await page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight}));check('video shorter than three minutes',media.duration>150&&media.duration<180);check('video public playback dimensions',media.width===1920&&media.height===1080);checks.push({case:'media metadata',...media});}
await browser.close();const result={productionUrl:base,measuredAt:new Date().toISOString(),checks,errors,liveTotal:initial.body.liveTotal,qaCode:code};await fs.writeFile('../deliverables/production-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify({checks:checks.length,errors,productionUrl:base}));
