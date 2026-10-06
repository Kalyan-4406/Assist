import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
const url=process.env.TEST_BASE_URL??'http://127.0.0.1:8787';
const chrome=await chromeLauncher.launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage']});
try {
  const result=await lighthouse(url+'/c/vnr-vjiet',{port:chrome.port,output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'});
  const lhr=result.lhr;
  const summary={url,measuredAt:new Date().toISOString(),formFactor:lhr.configSettings.formFactor,throttling:lhr.configSettings.throttling,categories:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','speed-index','total-blocking-time','cumulative-layout-shift'].map(k=>[k,lhr.audits[k].displayValue])),opportunities:Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<.9).map(a=>({id:a.id,title:a.title,value:a.displayValue,description:a.description,details:a.details})).slice(0,15)};
  await fs.writeFile(path.resolve('../deliverables/lighthouse-report.json'),result.report);
  await fs.writeFile(path.resolve('../deliverables/performance-summary.json'),JSON.stringify(summary,null,2));
  console.log(JSON.stringify({...summary,opportunities:summary.opportunities.map(o=>({id:o.id,title:o.title,value:o.value}))}));
} finally {await chrome.kill();}
