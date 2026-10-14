'use strict';

// Use the current Wistia player so speed is configured on the player itself.
function createOverviewPlayer(mediaId,title,color){
 const player=document.createElement('wistia-player');
 player.setAttribute('media-id',mediaId);
 player.setAttribute('playback-rate','1.25');
 player.setAttribute('player-color',color);
 player.setAttribute('autoplay','');
 player.setAttribute('playsinline','');
 player.setAttribute('settings-control','true');
 player.setAttribute('playback-rate-control','true');
 player.setAttribute('aria-label',title);
 player.tabIndex=0;
 // Set the default at initialization and first playback, not on later resumes.
 player.addEventListener('api-ready',()=>{player.playbackRate=1.25;},{once:true});
 player.addEventListener('play',()=>{player.playbackRate=1.25;},{once:true});
 return player;
}

const $=id=>document.getElementById(id);
const heroVideos={
 intro:{title:'Dreams Score Report Intro',cover:'assets/dreams-score-intro-cover.png',src:'/videos/dreams-score-business.mp4',label:'Watch the intro ▶'},
 overview:{title:'Show Me The Money — business owner briefing',cover:'assets/video-cover.png',src:'https://fast.wistia.net/embed/iframe/xy4ob0ihb2?autoPlay=true&playerColor=1256ff',label:'Watch the overview ▶'}
};
let activeVideo='intro';
function selectVideo(key){
 if(key===activeVideo)return;
 const previous=$('video-frame').querySelector('video,wistia-player');if(previous&&typeof previous.pause==='function')previous.pause();
 activeVideo=key;
 const data=heroVideos[key],button=document.createElement('button'),img=document.createElement('img');
 button.type='button';button.id='play-video';button.className='video-cover';button.setAttribute('aria-label','Play '+data.title);
 img.src=data.cover;img.alt=data.title+' video cover';img.width=1672;img.height=941;button.append(img);
 $('video-frame').replaceChildren(button);
 $('video-heading').textContent=key==='intro'?'DREAMS SCORE REPORT INTRO':'THE BUSINESS OWNER BRIEFING';
 $('watch-video').textContent=data.label;
 document.querySelectorAll('[data-video]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.video===key)));
}
function playVideo(){
 const frame=$('video-frame');if(frame.querySelector('iframe,video,wistia-player'))return;
 const data=heroVideos[activeVideo];let player;
 if(activeVideo==='intro'){
  player=document.createElement('video');player.controls=true;player.playsInline=true;player.preload='metadata';player.defaultPlaybackRate=1.25;player.playbackRate=1.25;player.addEventListener('loadedmetadata',()=>{player.playbackRate=1.25;},{once:true});player.addEventListener('play',()=>{player.playbackRate=1.25;},{once:true});player.poster=data.cover;player.src=data.src;player.setAttribute('aria-label',data.title);
 }else{
  player=createOverviewPlayer('xy4ob0ihb2',data.title,'#1256ff');
 }
 frame.replaceChildren(player);player.focus();
 if(activeVideo==='intro')player.play().catch(()=>{});
 $('watch-video').textContent='Video opened';
}
document.querySelectorAll('[data-video]').forEach(b=>b.addEventListener('click',()=>selectVideo(b.dataset.video)));
$('video-frame').addEventListener('click',e=>{if(e.target.closest('.video-cover'))playVideo()});
$('watch-video').addEventListener('click',playVideo);
const reportData=[['See more than a single expense.','Connect funding, benefits, expenses, assets, tax credits, and protection in one place. The report makes it easier to see where to focus.'],['Put the estimate in context.','The sample separates opportunity areas and shows the assumptions behind its estimates. Amounts are a starting point for discussion—not verified savings or a promised return.'],['Know what to investigate next.','Use the findings to prioritize a specialist conversation. Validate eligibility, costs, implementation requirements, and the potential impact before deciding.']];
const tabs=[...document.querySelectorAll('[data-report]')];function setReport(n,focus=false){tabs.forEach((b,i)=>{b.setAttribute('aria-selected',i===n);b.tabIndex=i===n?0:-1});$('report-panel').setAttribute('aria-labelledby',tabs[n].id);$('report-panel').replaceChildren(Object.assign(document.createElement('h3'),{textContent:reportData[n][0]}),Object.assign(document.createElement('p'),{textContent:reportData[n][1]}));if(focus)tabs[n].focus();}
tabs.forEach((b,i)=>{b.addEventListener('click',()=>setReport(i));b.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();setReport(e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3,true)}})});
const areas=[
 {id:'rd',label:'R&D Tax Credits',color:'#c498ff',value:40000,kind:'credit'},
 {id:'payroll',label:'Payroll Tax Savings',color:'#ff9cc5',value:15000,kind:'saving'},
 {id:'health',label:'Group health',color:'#38c9ff',value:36000,kind:'saving'},
 {id:'technology',label:'Technology & telecom',color:'#6d92ff',value:12000,kind:'saving'},
 {id:'energy',label:'Energy & utilities',color:'#ffcf68',value:18000,kind:'saving'},
 {id:'other',label:'Other overpayments',color:'#4ee3bd',value:9000,kind:'saving'}
];
function opportunityTotals(values){const credits=values[0],annual=values.slice(1).reduce((a,b)=>a+b,0),total=annual+credits;return{annual,credits,monthly:total/12,total}}
function increasedBusinessValue(annualSavings,multiple){return annualSavings*multiple}
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);let announce;
function updateImpactChart(key,values,minimum){
 const ceiling=Math.max(minimum,Math.ceil(values[2]/minimum)*minimum);
 $(key+'-chart-total').textContent=money(values[2]);$(key+'-ceiling').textContent=money(ceiling)+' scale';
 values.forEach((v,i)=>{const bar=$(key+'-bar-'+i),label=['Operating savings','Recurring R&D credits','Combined total'][i];bar.style.height=(v/ceiling*100)+'%';bar.setAttribute('aria-label',label+': '+money(v));$(key+'-tip-'+i).textContent=money(v);});
}
function calculate(){
 const values=areas.map(a=>Number($(a.id).value));const total=opportunityTotals(values);
 $('first-year-out').textContent=money(total.total);$('annual-out').textContent=money(total.annual);$('credits-out').textContent=money(total.credits);const multiple=Number($('earnings-multiple').value),businessValue=increasedBusinessValue(total.total,multiple);$('business-value-out').textContent=money(businessValue);$('earnings-multiple-out').textContent=multiple+'×';$('earnings-multiple').setAttribute('aria-valuetext',multiple+' times annual benefits');$('business-value-formula').textContent=money(total.total)+' in annual savings + credits × '+multiple+'× benefit multiple';
 updateImpactChart('valuation',[total.annual*multiple,total.credits*multiple,businessValue],1000000);
 updateImpactChart('benefits',[total.annual,total.credits,total.total],200000);
 $('breakdown-bar').innerHTML=areas.map((a,i)=>'<span style="width:'+(total.total?values[i]/total.total*100:0)+'%;background:'+a.color+'"></span>').join('');
 $('breakdown-list').innerHTML=areas.map((a,i)=>'<div><span><i style="background:'+a.color+'"></i>'+a.label+'</span><b>'+money(values[i])+'</b></div>').join('');
 areas.forEach((a,i)=>{$(a.id).setAttribute('aria-valuetext',money(values[i]));$(a.id).style.setProperty('--fill',values[i]/Number($(a.id).max)*100+'%')});
 clearTimeout(announce);announce=setTimeout(()=>{$('calc-status').textContent='Illustration: '+money(total.annual)+' annual recurring savings plus '+money(total.credits)+' potential annual R&D tax credits equals '+money(total.total)+' potential total annual benefit. Potential increased business value: '+money(businessValue)+' at '+multiple+' times annual savings plus recurring credits.'},300);
}
areas.forEach(a=>{const range=$(a.id),amount=$(a.id+'-amount');range.addEventListener('input',()=>{amount.value=range.value;calculate()});function updateAmount(){if(amount.value==='')return;const v=Math.min(Number(range.max),Math.max(0,Number(amount.value)||0));range.value=String(Math.round(v/Number(range.step))*Number(range.step));calculate()}amount.addEventListener('input',updateAmount);amount.addEventListener('change',()=>{if(amount.value==='')range.value=0;else updateAmount();amount.value=range.value;calculate()})});
$('earnings-multiple').addEventListener('input',calculate);
function loadAmounts(example){$('earnings-multiple').value=5;areas.forEach(a=>{$(a.id).value=example?a.value:0;$(a.id+'-amount').value=$(a.id).value});calculate()}
$('reset').addEventListener('click',()=>loadAmounts(true));$('clear').addEventListener('click',()=>loadAmounts(false));calculate();
const slides=[
['d','CAPITAL & CASH FLOW','Debt & corporate funding','Could a different capital structure support your next move? Examine funding needs, existing debt, and cash-flow priorities.','Is your financing supporting the business you want to build next?'],
['r','EMPLOYEES & THE FUTURE','Retirement & employee benefits','Explore plan design, participation, and benefits that support employees while fitting the economics of your business.','Are your retirement and benefit programs delivering the value your people need?'],
['e','A CLOSER LOOK AT COSTS','Expense reduction','Review benefits, technology, energy, and other operating costs for potential inefficiencies and better-fit options.','Which expenses have grown without a fresh review of what you receive?'],
['a','MORE FROM WHAT YOU HAVE','Asset optimization','Consider how reputation, marketing, customer relationships, and AI tools could work together more effectively.','Could the assets you already have create more value with a different approach?'],
['m','OPPORTUNITY IN THE DETAILS','Money & tax credits','Identify tax-credit questions for qualified specialists to assess against your activities, records, and eligibility.','Have the right experts reviewed the activities behind your numbers?'],
['s','RESILIENCE & CONTINUITY','Security & protection','Look at insurance, key-person exposure, business continuity, and technology protection as one connected risk picture.','What would disrupt the business—and how well are you prepared?']];
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),buttons=[...document.querySelectorAll('[data-slide]')];let index=0,paused=reduced.matches,hover=false,visible=false,timer;const dialog=$('image-dialog');
function sync(){clearInterval(timer);if(!paused&&!hover&&visible&&!document.hidden&&!dialog.open)timer=setInterval(()=>show(index+1,false),9000);$('pause').textContent=paused?'Play ▶':'Pause Ⅱ';$('pause').setAttribute('aria-pressed',String(paused));}
function show(n,manual=true){index=(n+slides.length)%slides.length;const d=slides[index];$('slide-image').src='assets/dreams-'+d[0]+'.png';$('slide-image').alt=d[0].toUpperCase()+' — '+d[2]+' concept artwork';$('slide-kicker').textContent=String(index+1).padStart(2,'0')+' / '+d[1];$('slide-title').textContent=d[2];$('slide-description').textContent=d[3];$('slide-question').textContent=d[4];$('slide-count').textContent=String(index+1).padStart(2,'0')+' / 06';buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(index===i)));if(manual){paused=true;$('slide-status').textContent='Slide '+(index+1)+' of 6: '+d[2]}sync()}
buttons.forEach((b,i)=>b.addEventListener('click',()=>show(i)));$('prev').addEventListener('click',()=>show(index-1));$('next-slide').addEventListener('click',()=>show(index+1));$('pause').addEventListener('click',()=>{paused=!paused;sync()});$('carousel').addEventListener('mouseenter',()=>{hover=true;sync()});$('carousel').addEventListener('mouseleave',()=>{hover=false;sync()});$('carousel').addEventListener('focusin',e=>{if(e.target!==$('pause')){paused=true;sync()}});$('carousel').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1))}});
let touch;$('swipe-area').addEventListener('touchstart',e=>{touch={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});$('swipe-area').addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))show(index+(dx<0?1:-1));touch=null},{passive:true});
$('expand').addEventListener('click',()=>{paused=true;$('large-image').src=$('slide-image').src;$('large-image').alt=$('slide-image').alt;$('dialog-title').textContent=slides[index][2];dialog.showModal();sync()});$('close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{$('expand').focus();sync()});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',()=>{if(reduced.matches)paused=true;sync()});if('IntersectionObserver' in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync()},{threshold:.25}).observe($('carousel'));else{visible=true;sync()}
