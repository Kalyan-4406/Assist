import {test} from 'node:test';
import assert from 'node:assert/strict';
const d=await import('../lib/domain.ts');
test('copied messages preserve a demo disclosure outside the app',()=>{
 assert.equal(d.labelDemoMessage?.('26 classmates registered',true),'[Simulation: demo data included] 26 classmates registered');
 assert.equal(d.labelDemoMessage?.('3 classmates registered',false),'3 classmates registered');
});
test('adding a model key invalidates old cached template fallbacks',()=>{
 const now=Date.now();
 assert.equal(d.reuseCardCache?.({source:'template',created_at:new Date(now-120000).toISOString()},true,now),false);
 assert.equal(d.reuseCardCache?.({source:'ai',created_at:new Date(now-120000).toISOString()},true,now),true);
 assert.equal(d.reuseCardCache?.({source:'template',created_at:new Date(now-120000).toISOString()},false,now),true);
});
test('transient referral lookup failures preserve attribution',()=>{
 assert.equal(d.shouldDiscardReferral?.(503),false);
 assert.equal(d.shouldDiscardReferral?.(undefined),false);
 assert.equal(d.shouldDiscardReferral?.(404),true);
});
