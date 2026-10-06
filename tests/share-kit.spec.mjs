import {test,expect} from '@playwright/test';
test('public share kit hydrates, tags every angle, and keeps demo disclosures',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/me/D00000');await page.getByRole('heading',{name:'Your share kit',exact:true}).waitFor();await page.waitForTimeout(800);expect(errors).toEqual([]);
 const links=page.getByRole('link',{name:'WhatsApp',exact:true});await expect(links).toHaveCount(3);
 for(const href of await links.evaluateAll(nodes=>nodes.map(n=>n.href))){const text=new URL(href).searchParams.get('text');expect(text).toContain('[Simulation: demo data included]');expect(text).toMatch(/angle=[RPF]/);expect(text).toContain('&v=');}
 await page.getByRole('button',{name:'Hinglish',exact:true}).click();await expect(links).toHaveCount(3);
});
