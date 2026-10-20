document.documentElement.classList.add('js');
const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
const reveals=[...document.querySelectorAll('.reveal')];
reveals.forEach((el,i)=>el.dataset.motion=i%3===1?'down':'up');
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
 e.target.classList.toggle('visible',e.isIntersecting);
 e.target.classList.toggle('passed',!e.isIntersecting&&e.boundingClientRect.top<0);
}),{threshold:0,rootMargin:'0px 0px -5% 0px'});
reveals.forEach(el=>observer.observe(el));
let scrollTick=false;
function renderScroll(){
 const y=window.scrollY,range=document.documentElement.scrollHeight-innerHeight;
 document.querySelector('.scroll-progress').style.transform='scaleX('+(range>0?y/range:0)+')';
 document.querySelector('header').classList.toggle('scrolled',y>60);
 if(!motionQuery.matches){
  document.querySelector('.hero-img').style.transform='translateY('+Math.min(y*.22,200)+'px) scale(1.08)';
  document.querySelector('.hero-content').style.transform='translateY('+Math.min(y*.08,80)+'px)';
 }
 scrollTick=false;
}
window.addEventListener('scroll',()=>{if(!scrollTick){requestAnimationFrame(renderScroll);scrollTick=true}},{passive:true});renderScroll();
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('nav');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}});
const edits={morning:{image:'breakfast',alt:'Illustrative breakfast with eggs and toast',kicker:'THE MORNING EDIT',title:'Wake up.<br>Take it easy.',description:'Avo toast, a colourful fruit bowl, or a coffee worth slowing down for. Breakfast and brunch make a lovely beginning to an Unawatuna day.',items:['Avo toast','Fruit bowls','Coffee & fresh juices'],tag:'A GOOD DAY STARTS HERE'},lunch:{image:'bowl',alt:'Illustrative colourful vegetable bowl',kicker:'THE LUNCH EDIT',title:'A little colour.<br>A lot of flavour.',description:'From fresh bowls to island-inspired plates, take a moment to explore something delicious. Public guest listings mention these dishes; call for today’s selection.',items:['Chicken poke bowl','Coconut chilli prawns','Falafel'],tag:'TAKE THE LONG LUNCH'},drinks:{image:'drinks',alt:'Illustrative citrus drink',kicker:'THE DRINKS EDIT',title:'Sip slowly.<br>Stay a while.',description:'Make room for a refreshing pause. Coffee, fresh juices and island-inspired drinks bring a little sunshine to the table.',items:['Carrot, ginger & beetroot juice','Coco colada','Curry leaf cocktail'],tag:'HERE’S TO ISLAND TIME'}};
const tabs=[...document.querySelectorAll('[role=tab]')];function selectTab(tab){const d=edits[tab.dataset.category];tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1});document.querySelector('#food-panel').setAttribute('aria-labelledby',tab.id);const img=document.querySelector('#food-image');img.src='assets/'+d.image+'.jpg';img.alt=d.alt;document.querySelector('#food-kicker').textContent=d.kicker;document.querySelector('#food-title').innerHTML=d.title;document.querySelector('#food-description').textContent=d.description;document.querySelector('#food-list').innerHTML=d.items.map(x=>'<li>'+x+'<span>↗</span></li>').join('');document.querySelector('.photo-tag').textContent=d.tag}tabs.forEach((t,i)=>{t.addEventListener('click',()=>selectTab(t));t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();tabs[n].focus();selectTab(tabs[n])}})});
const lightbox=document.querySelector('#lightbox');document.querySelectorAll('[data-photo]').forEach(b=>b.addEventListener('click',()=>{lightbox.querySelector('img').src=b.dataset.photo;lightbox.querySelector('img').alt=b.dataset.caption;lightbox.querySelector('p').textContent=b.dataset.caption;lightbox.showModal()}));document.querySelector('#credits-open').addEventListener('click',()=>document.querySelector('#credits').showModal());document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});
