const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.TEST_URL||'http://127.0.0.1:8765/';
const out=process.env.TEST_OUTPUT||'test-results';
fs.mkdirSync(out,{recursive:true});const results=[];
async function check(page,name,fn){await fn();results.push(name);console.log('PASS',name);}
async function go(page,hash){await page.goto(base+'#'+hash);await page.waitForFunction(route=>document.getElementById('main').dataset.page===route,hash.split('/')[0]);}
(async()=>{
 for(const [name,type,width,height] of [['chromium-android',chromium,360,800],['webkit-iphone',webkit,390,844]]){
  const browser=await type.launch();const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,locale:'sv-SE',timezoneId:'Europe/Stockholm',colorScheme:'light'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-10-13T12:00:00+02:00'));
  await go(page,'home');
  await check(page,name+' all documents and responsive layouts',async()=>{
   for(const width of [320,360,390,430,768,1024,1440]){
    await page.setViewportSize({width,height:844});
    for(const route of ['home','pm','jaktregler','jakttider','stadgar','protokoll','aso','saved','more','install','about']){
     await go(page,route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} at ${width}`);
    }
   }
  });
  await page.setViewportSize({width,height});
  await check(page,name+' search matches all documents and multiple words',async()=>{await go(page,'home');await page.locator('#q').fill('jaktledare');assert.ok(await page.locator('.card').count()>5);assert.ok(await page.locator('mark').count()>5);await page.locator('#q').fill('älg avgift');assert.ok(await page.locator('.card').count()>0);});
  await check(page,name+' search has safe empty and special-character results',async()=>{await page.locator('#q').fill('<img src=x onerror="window.hacked=true">');assert.equal(await page.locator('#articles img').count(),0);assert.equal(await page.evaluate(()=>window.hacked),undefined);assert.equal(await page.locator('.empty').count(),1);await page.locator('#q').fill('[');await page.locator('#q').fill('   ');assert.equal(await page.locator('.hero').count(),1);});
  await check(page,name+' changing section clears search',async()=>{await page.locator('#q').fill('rådjur');await page.locator('#bottomNav a[href="#jaktregler"]').click();await page.waitForFunction(()=>document.getElementById('q').value==='');assert.equal(await page.locator('#q').inputValue(),'');assert.equal(await page.locator('.card').count(),14);});
  await check(page,name+' accordions and expand/collapse all',async()=>{const head=page.locator('.card-head').first();await head.click();assert.equal(await head.getAttribute('aria-expanded'),'true');await head.click();assert.equal(await head.getAttribute('aria-expanded'),'false');await page.locator('#toggleAll').click();assert.equal(await page.locator('.card-body:visible').count(),14);await page.locator('#toggleAll').click();assert.equal(await page.locator('.card-body:visible').count(),0);});
  await check(page,name+' bookmarks persist and can be removed',async()=>{await page.locator('[data-save]').first().click();await page.locator('#bottomNav a[href="#saved"]').click();await page.waitForFunction(()=>document.getElementById('main').dataset.page==='saved');assert.equal(await page.locator('.card').count(),1);await page.reload();assert.equal(await page.locator('.card').count(),1);await page.locator('[data-save]').click();assert.equal(await page.locator('.card').count(),0);});
  await check(page,name+' PM shortcut opens exact fees section',async()=>{await go(page,'pm/pm-67');assert.equal(await page.locator('#pm-67 .card-body').isVisible(),true);assert.ok((await page.locator('#pm-67').innerText()).includes('300 kr'));});
  await check(page,name+' theme and larger text persist',async()=>{await go(page,'more');await page.locator('#darkSwitch').click();await page.locator('#textSwitch').click();await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');assert.equal(await page.locator('#textSwitch').getAttribute('aria-checked'),'true');await go(page,'jakttider');await page.locator('#toggleAll').click();await page.screenshot({path:`${out}/${name}-dark.png`,fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);});
  await check(page,name+' dates marked as table matches only',async()=>{assert.equal(await page.getByText('Lovligt nu',{exact:true}).count(),0);assert.ok(await page.getByText('Dagens datum ingår',{exact:true}).count()>0);});
  await check(page,name+' PM expires at Stockholm calendar boundary',async()=>{await page.clock.setFixedTime(new Date('2026-10-26T23:59:59+01:00'));await go(page,'pm');assert.equal(await page.locator('.card').count(),8);await page.clock.setFixedTime(new Date('2026-10-27T00:00:00+01:00'));await go(page,'home');assert.equal(await page.locator('.hero').count(),1);assert.equal(await page.locator('#main a[href="#pm"]').count(),0);await page.locator('#q').fill('Koperud');assert.equal(await page.locator('.card').count(),0);await page.clock.setFixedTime(new Date('2026-10-13T12:00:00+02:00'));});
  await check(page,name+(name==='webkit-iphone'?' offline reading and cached assets':' cached app opens offline'),async()=>{await go(page,'install');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();assert.ok(await page.evaluate(()=>Boolean(navigator.serviceWorker.controller)));await context.setOffline(true);if(name!=='webkit-iphone'){await page.reload();await page.locator('#main h1').waitFor();}else{console.log('NOTE WebKit on Windows cannot reload offline; verifying cache and offline in-page navigation.');}assert.equal(await page.evaluate(async()=>{try{await fetch('./network-probe?'+Date.now());return true;}catch{return false;}}),false);await page.evaluate(()=>{Object.defineProperty(navigator,'onLine',{get:()=>false,configurable:true});dispatchEvent(new Event('offline'));});assert.equal(await page.locator('#offlineNotice').isVisible(),true);await page.locator('#bottomNav a[href="#jaktregler"]').click();await page.waitForFunction(()=>document.getElementById('main').dataset.page==='jaktregler');assert.equal(await page.locator('.card').count(),14);await page.locator('#q').fill('avgift');assert.ok(await page.locator('.card').count()>0);await context.setOffline(false);});
  assert.deepEqual(errors,[],name+' page errors');results.push(name+' no browser errors');await browser.close();
 }
 const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});const page=await context.newPage();await page.goto(base);assert.equal(await page.locator('.fallback .card').count(),73);results.push('73 fallback sections without JavaScript');await browser.close();
 fs.writeFileSync(out+'/test-results.json',JSON.stringify({base,passed:results.length,results},null,2));console.log('TOTAL',results.length,'passed');
})().catch(e=>{console.error(e);process.exit(1)});
