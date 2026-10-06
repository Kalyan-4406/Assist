import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const base='https://campus-build-race-nxtwave.vabjashwanthreddy.chatgpt.site';
const output='../deliverables/screenshots';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const evidence=[];
for(const [route,name,width,height] of [['/','home-native',1024,1536],['/c/vnr-vjiet','college-native',1374,1145],['/c/vnr-vjiet','college-mobile-native',360,800]]){
  await page.setViewportSize({width,height});await page.goto(base+route);await page.waitForTimeout(900);
  if(width===360)await page.locator('.mobile-claim button').waitFor();
  await page.screenshot({path:`${output}/${name}.png`});
  evidence.push({route,viewport:{width,height},overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),type:await page.locator('h1').evaluate(el=>{const s=getComputedStyle(el);return {font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,lineHeight:s.lineHeight}}),images:await page.locator('.workspace-photo').evaluateAll(els=>els.map(el=>({source:el.currentSrc,loaded:el.complete&&el.naturalWidth>0}))) });
}
await fs.writeFile('../deliverables/fidelity-browser-evidence.json',JSON.stringify({base,measuredAt:new Date().toISOString(),evidence,errors},null,2));
console.log(JSON.stringify({evidence,errors}));await browser.close();
