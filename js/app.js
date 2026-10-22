/* ---- clean URLs: real paths like /wiki/chapter-9 (no #). Legacy #/wiki/... links are rewritten on load. ---- */
function hashOf(){
  var p = location.pathname;
  if(p && p !== '/' && p !== '/index.html') return '#' + p.replace(/\/+$/,'');
  return location.hash || '';
}
function goTo(h){
  var path = (!h || h === '#main') ? '/' : h.slice(1);
  if(path !== location.pathname) history.pushState(null, '', path);
  window.dispatchEvent(new Event('route'));
}
if('scrollRestoration' in history) history.scrollRestoration = 'manual';
(function(){
  if(location.hash.indexOf('#/') === 0){ history.replaceState(null, '', location.hash.slice(1)); }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href]');
    if(!a) return;
    var h = a.getAttribute('href');
    if(h === '#main' || h.indexOf('#/') === 0){ e.preventDefault(); goTo(h); window.scrollTo(0,0); }
  });
  window.addEventListener('popstate', function(){ window.dispatchEvent(new Event('route')); });
  window.addEventListener('hashchange', function(){ if(location.hash.indexOf('#/')===0){ history.replaceState(null, '', location.hash.slice(1)); window.dispatchEvent(new Event('route')); } });
})();
(function(){
  var S = window.OMNIARCH_STATE, A = window.OMNIARCH_ARTICLES;
  var fmt = function(n){ return n.toLocaleString('en-US'); };
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };

  /* spoiler-free narrator briefs, one per typeset chapter; the bench adds new entries as chapters are typeset */
  var BRIEFS = {
    1: "Before the first page turns, the narrator sets you on a mountaintop where a standoff has reached its height. The voice is cold and sure of itself, and it does not explain itself yet. Then the scene moves to the Gu Yue clan on Qing Mao Mountain, where the Aperture Opening Ceremony is approaching and every family is watching who will be chosen.",
    2: "The narrator now slows and turns the story back on itself. Expect the ground to shift: this chapter asks you to watch a familiar figure begin again, and it offers very little explanation at first. Read it for the questions it raises rather than the answers it withholds.",
    3: "A chapter of blunt, sharp exchanges. The narrator leans into the everyday friction of the clan and the people who live inside it. Read it for the voices and the tempers, and let the consequences arrive on their own.",
    4: "The clan and its protagonist are named aloud, placing you firmly inside the Gu Yue household and its daily rhythm. The narrator treats the ordinary as important here, because the chapter is building the ground that later events will stand on.",
    5: "This chapter reaches back to the myth of Ren Zu. Its title names an ancestral tradition of Gu, and the narrator invites you to read it as the deep foundation beneath the story rather than a detour from it.",
    6: "A chapter that looks ahead. Its title is a promise about what is to come, and the narrator asks you to hold on to the uncertainty it creates. Pay attention to who is planning and who is only reacting.",
    7: "The chapter introduces the idea of ranks and the inheritances passed down among masters. Watch how a legacy is set up and how the ranking system frames every ambition in the volume. The narrator treats the rules here as the rules the characters live by.",
    8: "A chapter about change, and about the people who remain. The narrator asks you to read the quiet moments as closely as the dramatic ones, because the shifts here are gradual and easy to miss.",
    9: "The title gives the tone away: relationships are pulling apart. The narrator keeps the focus on the spaces between characters, so read the silences and the distances as closely as the lines they speak."
  };
  /* ---- generate chapter articles + chapter index from the ledger ---- */
  S.chapters.forEach(function(c,i){
    var prev = S.chapters[i-1], next = S.chapters[i+1];
    var rows = [["Volume","Volume 1: Demonic Nature Never Changes"],["Number","Chapter "+c.n],["Position",(prev?"After Chapter "+prev.n:"Opens the volume")+(next?" · before Chapter "+next.n:"")]];
    var body;
    body = BRIEFS[c.n] ? [BRIEFS[c.n]] : ["This chapter’s brief is being written from the translation bench."];
    A["chapter-"+c.n] = { t:"Chapter "+c.n+": "+c.title, k:"Chapter", ib:rows, b:body,
      see:[ prev?"chapter-"+prev.n:"volume-1", next?"chapter-"+next.n:"chapters", "chapters" ],
      cat:["Chapters","Volume 1"] };
  });
  A.chapters.indexList = S.chapters.map(function(c){ return "chapter-"+c.n; });

  /* ---- growth counters on the main page ---- */
  var typeset = S.chapters.length;
  var cap = document.getElementById('today-caption');
  if(cap) cap.innerHTML = 'Today’s date at the translation bench: <b><a href="#/wiki/chapters">Chapter '+S.atBench+'</a> typesetting</b> · '+typeset+' of '+fmt(S.total)+' chapters typeset';
  var now = document.getElementById('now-bullet');
  if(now) now.innerHTML = '<b><a href="#/wiki/timeline">Now</a></b> - <a href="#/wiki/the-omniarch">The Omniarch</a> re-translation typesets the opening volume; <a href="#/wiki/chapter-'+S.chapters[typeset-1].n+'">Chapter '+S.chapters[typeset-1].n+'</a> is live and Chapter '+S.atBench+' sits at the bench.';
  var stats = document.getElementById('browse-stats');
  if(stats) stats.textContent = typeset+' chapters typeset of '+fmt(S.total)+' · '+S.parables+' parables of Ren Zu in the companion scripture · curated by The Omniarch';
  var list = document.getElementById('dir-chapters-list');
  if(list){
    list.innerHTML = S.chapters.map(function(c){ return '<a href="#/wiki/chapter-'+c.n+'">'+c.n+' · '+esc(c.title)+'</a>'; }).join(' · ')
      + ' (<i><b><a href="#/wiki/chapters">'+fmt(S.total-typeset)+' chapters to go — Chapter '+S.atBench+' at the bench</a></b></i>)';
  }

  /* ---- wiki router ---- */
  var mainView = document.getElementById('main-view'),
      wikiView = document.getElementById('wiki-view'),
      articleEl = document.getElementById('wiki-article'),
      crumbEl = document.getElementById('crumb-here'),
      retrievedEl = document.getElementById('wiki-retrieved');

  function link(slug,label){ return '<a href="#/wiki/'+slug+'">'+esc(label||A[slug].t)+'</a>'; }

  function indexBlock(kind){
    var keys = Object.keys(A).filter(function(k){ return (A[k].cat||[]).some(function(c){return c.toLowerCase()===kind;}) || k.indexOf('chapter-')===0&&kind==='chapters'; });
    if(kind==='chapters') keys = (A.chapters.indexList||[]).slice();
    if(!keys.length) return '';
    return '<h2>Index</h2><ul class="index-list">'+keys.map(function(k){return '<li>'+link(k)+'</li>';}).join('')+'</ul>';
  }

  var sideEl = document.getElementById('wiki-side'),
      titleEl = document.getElementById('wiki-title'),
      subEl = document.getElementById('wiki-sub'),
      talkTab = document.getElementById('talk-tab'),
      talkLabel = document.getElementById('talk-tab-label'),
      routeMode = 'article', curSlug = null;

  function indexKeys(kind){
    var keys = Object.keys(A).filter(function(k){ return (A[k].cat||[]).some(function(c){return c.toLowerCase()===kind;}) || (k.indexOf('chapter-')===0 && kind==='chapters'); });
    if(kind==='chapters') keys = (A.chapters.indexList||[]).slice();
    return keys;
  }

  var PORTALS = [['chapters','Chapters'],['characters','Characters'],['gu','Gu'],['clans','Clans'],['locations','Locations'],['cultivation','Cultivation'],['glossary','Glossary'],['the-legends-of-ren-zu','Legends of Ren Zu'],['timeline','Timeline']];

  function portalHTML(slug,a){
    var kind=a.index, keys=indexKeys(kind);
    var tabs='<div class="portal-tabs">'+PORTALS.map(function(t){return '<a href="#/wiki/'+t[0]+'" class="'+(t[0]===slug?'on':'')+'">'+t[1]+'</a>';}).join('')+'</div>';
    var gridKeys = keys.filter(function(k){return A[k].img;});
    var grid = gridKeys.length ? '<div class="tg-section-divider"><span>Featured</span></div><div class="portal-grid">'+gridKeys.map(function(k){return '<a href="#/wiki/'+k+'"><div class="sq" style="background-image:url(\''+A[k].img+'\')"></div><div class="lb">'+esc(A[k].t)+'</div></a>';}).join('')+'</div>' : '';
    var groups={};
    keys.forEach(function(k){ var g=A[k].k||'Other'; (groups[g]=groups[g]||[]).push(k); });
    var gk=Object.keys(groups);
    var boxes='<div class="tg-section-divider"><span>Categories</span></div><div class="portal-boxes">'+gk.slice(0,4).map(function(g){
      return '<div class="portal-box"><h4>By '+esc(g)+'</h4><ul>'+groups[g].map(function(k){return '<li>'+link(k)+'</li>';}).join('')+'</ul></div>';
    }).join('')+'</div>';
    return tabs+grid+boxes;
  }

  function sideHTML(a){
    var toc=[['sec-overview','Overview']];
    if(a.ib&&a.ib.length) toc.push(['sec-details','Details']);
    if(a.index) toc.push(['sec-portal','Explore']);
    if(a.see&&a.see.length) toc.push(['sec-see','See also']);
    return '<div class="side-box"><h4>Last modified</h4><div class="toc"><div class="row"><span><svg style="width:14px;height:14px;vertical-align:-2px;opacity:.7"><use href="#glyph-history"/></svg> Today · The Omniarch</span></div></div></div>'
      +'<div class="side-box"><h4>Contents</h4><div class="toc">'+toc.map(function(t){return '<a href="#" data-sec="'+t[0]+'">'+t[1]+'<span class="caret">⌄</span></a>';}).join('')+'</div></div>';
  }

  function talkHTML(a,slug){
    return '<div class="talk-banner"><h3>Want to talk about '+esc(a.t)+' in real-time?</h3><p>Join the Discord server for discussions, readings and theories between typesettings.</p><a class="tg-button tg-button--progressive" href="https://discord.gg/UgwTKn4sQf" target="_blank" rel="noreferrer noopener">Join our Discord</a></div>'
      + '<h2 class="sec" id="sec-overview"><span class="caret">⌃</span>Start a discussion about '+esc(a.t)+'</h2><div class="sec-body"><p>Discussion pages are where readers weigh how to make the encyclopedia the best it can be — corrections, glossary notes, theories. The bench gathers on Discord; pull up a chair and start the thread for '+link(slug)+'.</p><a class="tg-button" href="https://discord.gg/UgwTKn4sQf" target="_blank" rel="noreferrer noopener">Start a discussion</a></div>';
  }

  function render(slug){
    var a = A[slug];
    if(!a){ // A-to-Z or unknown
      if(slug && slug.indexOf('atoz/')===0){
        var L = slug.slice(5).toUpperCase();
        var keys = Object.keys(A).filter(function(k){ return A[k].t.toUpperCase().indexOf(L)===0; }).sort(function(x,y){return A[x].t.localeCompare(A[y].t);});
        titleEl.textContent='Index · '+L; subEl.textContent='From the Reverend Insanity Encyclopedia'; talkLabel.textContent='Discussion';
        articleEl.innerHTML = (keys.length ? '<ul class="index-list">'+keys.map(function(k){return '<li>'+link(k)+'</li>';}).join('')+'</ul>' : '<div class="stub-note">No articles under this letter yet — the encyclopedia grows with the bench.</div>');
        sideEl.innerHTML='';
        crumbEl.textContent = 'Index · '+L;
        retrievedEl.textContent = 'Retrieved from “Reverend Insanity Encyclopedia — Index: '+L+'”. Growth ledger: '+S.chapters.length+' of '+fmt(S.total)+' chapters typeset.';
        return true;
      }
      return false;
    }
    curSlug = slug;
    var talk = routeMode==='talk';
    titleEl.textContent = (talk?'Talk: ':'')+a.t;
    subEl.textContent = talk ? 'Discussion page of '+a.t  : (a.k ? a.k+' · From the Reverend Insanity Encyclopedia' : 'From the Reverend Insanity Encyclopedia');
    talkLabel.textContent = talk ? 'Page' : 'Discussion';
    crumbEl.textContent = (talk?'Talk · ':'')+(a.k ? a.k+' · '+a.t : a.t);
    var html='';
    if(talk){ html = talkHTML(a,slug); }
    else{
      html += '<div class="wiki-fig">'+(a.img?'<img src="'+a.img+'" alt="'+esc(a.t)+'">':'<div class="ph"><svg><use href="#glyph-cicada"/></svg></div>')
        +'<div class="cap">'+(a.img?'Art: '+esc(a.art||'community artist')+' · community archive — '+esc(a.t)+'.':'')+'</div></div>';
      html += '<h2 class="sec" id="sec-overview"><span class="caret">⌃</span>Overview</h2><div class="sec-body">'+a.b.map(function(p){return '<p>'+esc(p)+'</p>';}).join('')+'</div>';
      if(a.ib&&a.ib.length) html += '<h2 class="sec" id="sec-details"><span class="caret">⌃</span>Details</h2><div class="sec-body"><table class="wiki-table">'+a.ib.map(function(r){return '<tr><th>'+esc(r[0])+'</th><td>'+esc(r[1])+'</td></tr>';}).join('')+'</table></div>';
      if(a.index) html += '<h2 class="sec" id="sec-portal"><span class="caret">⌃</span>Explore</h2><div class="sec-body">'+portalHTML(slug,a)+'</div>';
      if(a.see&&a.see.length) html += '<h2 class="sec" id="sec-see"><span class="caret">⌃</span>See also</h2><div class="sec-body"><ul class="index-list">'+a.see.filter(function(x){return A[x];}).map(function(x){return '<li>'+link(x)+'</li>';}).join('')+'</ul></div>';
      if(a.cat&&a.cat.length) html += '<div class="wiki-cats">Categories: '+a.cat.map(function(c){return '<span class="chip">'+esc(c)+'</span>';}).join(' ')+'</div>';
    }
    articleEl.innerHTML = html;
    sideEl.innerHTML = talk ? '' : sideHTML(a);
    retrievedEl.textContent = 'Retrieved from “Reverend Insanity Encyclopedia — '+a.t+'”. Growth ledger: '+S.chapters.length+' of '+fmt(S.total)+' chapters typeset · Chapter '+S.atBench+' at the bench.';
    return true;
  }

  if(talkTab) talkTab.addEventListener('click', function(e){
    e.preventDefault();
    if(!curSlug) return;
    routeMode = routeMode==='talk' ? 'article' : 'talk';
    render(curSlug);
  });

  wikiView.addEventListener('click', function(e){
    var caret=e.target.closest('h2.sec .caret');
    if(caret){ caret.parentElement.classList.toggle('collapsed'); e.preventDefault(); return; }
    var t=e.target.closest('a[data-sec]');
    if(t){ e.preventDefault(); var el=document.getElementById(t.getAttribute('data-sec')); if(el) el.scrollIntoView({behavior:'smooth'}); }
  });

  function route(){
    var h = hashOf() || '#main';
    if(h.indexOf('#/wiki/')===0){
      var slug = h.slice(7);
      if(slug!==curSlug) routeMode='article';
      if(render(slug)){
        mainView.hidden = true; wikiView.hidden = false;
        window.scrollTo(0,0);
        return;
      }
    }
    mainView.hidden = false; wikiView.hidden = true;
    window.dispatchEvent(new Event('resize'));
    if(h==='#main') window.scrollTo(0,0);
  }
  window.addEventListener('route', route);
  route();

  /* ---- random article ---- */
  var rnd = document.getElementById('random-article');
  if(rnd) rnd.addEventListener('click', function(e){
    e.preventDefault();
    var keys = Object.keys(A).filter(function(k){return k.indexOf('atoz')!==0;});
    goTo('#/wiki/'+keys[Math.floor(Math.random()*keys.length)]);
  });

  /* ---- search ---- */
  var box=document.getElementById('search-box'), input=document.getElementById('search-input'), sug=document.getElementById('search-suggest');
  function toggleSearch(){ box.classList.toggle('open'); if(box.classList.contains('open')) input.focus(); }
  ['search-trigger','rail-search'].forEach(function(id){ var el=document.getElementById(id); if(el) el.addEventListener('click',toggleSearch); });
  document.addEventListener('keydown',function(e){ if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();toggleSearch();} if(e.key==='Escape'){sug.style.display='none';} });
  /* search: titles and categories rank first; article text and info rows (incl. Chinese) match too */
  function bodyText(k){
    var a=A[k]||{}, parts=[];
    (a.b||[]).forEach(function(x){ parts.push(String(x)); });
    (a.ib||[]).forEach(function(r){ parts.push(r.join(' ')); });
    return parts.join(' ').toLowerCase();
  }
  function findHits(q){
    var titles=[], bodies=[];
    Object.keys(A).forEach(function(k){
      if(!A[k] || k.indexOf('atoz')===0) return;
      var t=(A[k].t||'').toLowerCase(), kind=(A[k].k||'').toLowerCase();
      if(t.indexOf(q)>-1 || kind.indexOf(q)>-1) titles.push(k);
      else if(bodyText(k).indexOf(q)>-1) bodies.push(k);
    });
    titles.sort(function(x,y){ var px=(A[x].t||'').toLowerCase().indexOf(q)===0?0:1, py=(A[y].t||'').toLowerCase().indexOf(q)===0?0:1; return px-py; });
    return titles.concat(bodies).slice(0,8);
  }
  function renderHits(q){
    var hits=findHits(q);
    if(!hits.length){ sug.innerHTML='<div class="s-empty">No entries match “'+esc(q)+'”.</div>'; sug.style.display='block'; return; }
    sug.innerHTML = hits.map(function(k){
      var img = A[k].img ? ' style="background-image:url(\'' + A[k].img + '\')"' : '';
      return '<button data-slug="'+k+'"><span class="s-thumb'+(A[k].img?'':' empty')+'"'+img+'></span><span class="s-txt"><span class="s-title">'+esc(A[k].t)+'</span><span class="s-kind">'+esc(A[k].k||'')+'</span></span></button>';
    }).join('');
    sug.style.display='block';
  }
  input.addEventListener('input', function(){
    var q = input.value.trim().toLowerCase();
    if(!q){ sug.style.display='none'; return; }
    renderHits(q);
  });
  input.addEventListener('keydown', function(e){
    if(e.key!=='Enter') return;
    e.preventDefault();
    var q = input.value.trim().toLowerCase();
    if(!q) return;
    var first = findHits(q)[0];
    if(first){ goTo('#/wiki/'+first); sug.style.display='none'; box.classList.remove('open'); input.value=''; }
    else { renderHits(q); }
  });
  sug.addEventListener('click', function(e){
    var b = e.target.closest('button[data-slug]'); if(!b) return;
    goTo('#/wiki/'+b.getAttribute('data-slug'));
    sug.style.display='none'; box.classList.remove('open'); input.value='';
  });

  /* sticky bar: once the article heading scrolls away, the top bar shows the page title (Gateway-style) */
  (function(){
    var bar=document.getElementById('wiki-topbar'), tt=document.getElementById('wiki-topbar-title');
    if(!bar||!tt) return;
    function update(){
      var h=wikiView.querySelector('h1, h2'), show=false, txt='';
      if(!wikiView.hidden && h){ txt=h.textContent.trim(); var r=h.getBoundingClientRect(); show = r.bottom < 56 && window.scrollY > 0; }
      bar.classList.toggle('has-title', show);
      if(tt.textContent!==txt) tt.textContent=txt;
    }
    window.addEventListener('scroll', update, {passive:true});
    window.addEventListener('route', function(){ setTimeout(update,0); });
    update();
  })();

  /* ---- seal: hover swaps to home (CSS); click scrolls top ---- */
  var seal=document.getElementById('seal-btn');
  if(seal) seal.addEventListener('click', function(){ goTo('#main'); });

  /* ---- drawer (right side) ---- */
  var drawer=document.getElementById('drawer');
  function setDrawer(open){ drawer.classList.toggle('open', open); }
  var menuBtn=document.getElementById('rail-menu');
  if(menuBtn) menuBtn.addEventListener('click', function(){ setDrawer(!drawer.classList.contains('open')); });
  var dclose=document.getElementById('drawer-close');
  if(dclose) dclose.addEventListener('click', function(){ setDrawer(false); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') setDrawer(false); });
  drawer.addEventListener('click', function(e){ if(e.target.closest('a')) setDrawer(false); });
  var drand=document.getElementById('drawer-random');
  if(drand) drand.addEventListener('click', function(e){
    e.preventDefault();
    var keys=Object.keys(A);
    goTo('#/wiki/'+keys[Math.floor(Math.random()*keys.length)]);
  });
  var sp=document.getElementById('stat-pages'); if(sp) sp.textContent=Object.keys(A).length;
  var si=document.getElementById('stat-imgs'); if(si) si.textContent=10;
  var sc=document.getElementById('stat-ch'); if(sc) sc.textContent=S.chapters.length;
  var spar=document.getElementById('stat-par'); if(spar) spar.textContent=S.parables;

  /* ---- live date ---- */
  (function(){
    var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    var short=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var nowD=new Date();
    var h=document.getElementById('today-heading');
    if(h)h.textContent=nowD.getDate()+' '+months[nowD.getMonth()];
    for(var o=-2;o<=2;o++){
      var el=document.getElementById(o===0?'d0':'d'+o);
      if(!el)continue;
      var t=new Date(nowD);t.setDate(nowD.getDate()+o);
      el.textContent=t.getDate()+' '+short[t.getMonth()];
    }
  })();
})();

/* inner-page topbar: reuse the masthead wordmark; Enter jumps to the main search */
(function(){
  var logo=document.getElementById('wiki-topbar-logo'), src=document.querySelector('.tg-mainpage-header .wordmark-img');
  if(logo){ document.querySelectorAll('.tg-mainpage-header .wordmark-img').forEach(function(s){ var im=s.cloneNode(true); im.className='wiki-topbar-img '+(s.classList.contains('logo-dark')?'logo-dark':'logo-light'); logo.appendChild(im); }); }
  var f=document.getElementById('wiki-topbar-search'), wi=document.getElementById('wiki-topbar-input');
  if(f&&wi) f.addEventListener('submit',function(e){
    e.preventDefault(); var v=wi.value.trim(); goTo('#main');
    var mi=document.getElementById('search-input'), trig=document.getElementById('search-trigger');
    setTimeout(function(){ if(mi){ mi.value=v; mi.dispatchEvent(new Event('input')); mi.focus(); } if(trig&&!document.getElementById('search-box').classList.contains('open')) trig.click(); },60);
  });
})();

/* masthead: span from the left rail to the right edge of the window, at any width */
(function(){
  function fit(){
    var h=document.querySelector('.tg-mainpage-header');
    if(!h) return;
    var rail=document.querySelector('.rail'), railW=rail?rail.getBoundingClientRect().right:0;
    h.style.position='relative'; h.style.marginLeft='0'; h.style.marginRight='0'; h.style.maxWidth='none';
    h.style.width=(document.documentElement.clientWidth-railW)+'px'; h.style.left='0px';
    var cur=h.getBoundingClientRect().left;
    h.style.left=(railW-cur)+'px';
  }
  addEventListener('resize',fit); addEventListener('load',fit); fit();
})();
