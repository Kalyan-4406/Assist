import {test,expect} from '@playwright/test';
test.use({viewport:{width:360,height:800}});
test('mobile navigation reaches plan and submission without overflow',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Open navigation',exact:true}).click();
  const menu=page.getByRole('navigation',{name:'Mobile navigation'});await expect(menu.getByRole('link',{name:'Growth desk',exact:true})).toBeVisible();
  await menu.getByRole('link',{name:'Growth plan',exact:true}).click();await expect(page.getByRole('heading',{level:1})).toContainText('500 registrations.');
  await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Submission kit',exact:true}).click();await expect(page.getByRole('heading',{name:'The submission kit.',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
