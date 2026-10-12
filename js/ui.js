(function(){
  document.querySelectorAll('.tg-card').forEach(function(c){
    var a=c.querySelector('a[href^="#/"]'); if(!a) return;
    c.setAttribute('data-href',a.getAttribute('href'));
    c.addEventListener('click',function(e){ if(e.target.closest('a,button,input')) return; location.hash=a.getAttribute('href'); });
  });
  var sc=document.getElementById('slide-card');
  if(sc){ var slides=sc.querySelectorAll('.slide'), dots=sc.querySelectorAll('#slide-dots button'), i=0, t=null;
    function go(n){ i=(n+slides.length)%slides.length; slides.forEach(function(s,k){s.classList.toggle('on',k===i)}); dots.forEach(function(d,k){d.classList.toggle('on',k===i)}); }
    function auto(){ clearInterval(t); t=setInterval(function(){go(i+1)},7000); }
    dots.forEach(function(d,k){ d.addEventListener('click',function(e){e.stopPropagation();go(k);auto();}); });
    sc.addEventListener('mouseenter',function(){clearInterval(t)});
    sc.addEventListener('mouseleave',auto);
    auto();
  }
  var pop=document.getElementById('settings-pop'), gear=document.getElementById('rail-gear');
  var prefs={text:'standard',color:'auto',width:'standard'};
  try{ Object.assign(prefs, JSON.parse(localStorage.getItem('omniarch-prefs')||'{}')); }catch(e){}
  var mq=window.matchMedia('(prefers-color-scheme: dark)');
  function apply(){ var el=document.documentElement;
    el.setAttribute('data-text',prefs.text); el.setAttribute('data-width',prefs.width);
    var dark = prefs.color==='dark' || (prefs.color==='auto' && mq.matches);
    el.setAttribute('data-theme', dark?'dark':'light');
    document.querySelectorAll('.settings-pop .seg').forEach(function(seg){ var p=seg.getAttribute('data-pref');
      seg.querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-v')===prefs[p]); }); });
  }
  if(mq.addEventListener) mq.addEventListener('change',apply);
  if(gear&&pop){ gear.addEventListener('click',function(e){ e.stopPropagation(); pop.classList.toggle('open'); });
    document.addEventListener('click',function(e){ if(!pop.contains(e.target)&&!gear.contains(e.target)) pop.classList.remove('open'); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') pop.classList.remove('open'); });
    pop.querySelectorAll('.seg button').forEach(function(b){ b.addEventListener('click',function(){ prefs[b.parentElement.getAttribute('data-pref')]=b.getAttribute('data-v'); localStorage.setItem('omniarch-prefs',JSON.stringify(prefs)); apply(); }); });
  }
  var proxTargets=[].slice.call(document.querySelectorAll('.tg-card,.template-navpill'));
  var pTick=false;
  document.addEventListener('mousemove',function(e){
    if(pTick) return; pTick=true;
    requestAnimationFrame(function(){ pTick=false;
      for(var i=0;i<proxTargets.length;i++){ var el=proxTargets[i], r=el.getBoundingClientRect();
        var dx=Math.max(r.left-e.clientX,0,e.clientX-r.right), dy=Math.max(r.top-e.clientY,0,e.clientY-r.bottom);
        var d=Math.sqrt(dx*dx+dy*dy); var f=Math.max(0,1-d/90);
        el.style.setProperty('--prox',f.toFixed(3));
      }
    });
  });
  apply();
})();
