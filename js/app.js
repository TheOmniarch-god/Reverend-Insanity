(function(){
  var S = window.OMNIARCH_STATE, A = window.OMNIARCH_ARTICLES;
  var fmt = function(n){ return n.toLocaleString('en-US'); };
  var esc = function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };

  /* ---- generate chapter articles + chapter index from the ledger ---- */
  S.chapters.forEach(function(c,i){
    var prev = S.chapters[i-1], next = S.chapters[i+1];
    var rows = [["Volume","Volume 1: Demonic Nature Never Changes"],["Number","Chapter "+c.n],["Position",(prev?"After Chapter "+prev.n:"Opens the volume")+(next?" · before Chapter "+next.n:"")]];
    var body;
    if(c.n===1){ body=["The volume opens on a mountaintop at the end of a life: the united Righteous Path demands the Spring Autumn Cicada, and Fang Yuan — blood-soaked, expressionless, his gaze like an ancient well — answers them with a laugh and a detonation. Then spring rain falls on Qing Mao Mountain, and the Gu Yue clan gathers for the Aperture Opening Ceremony."]; }
    else if(c.n===2){ body=["Time reverses. Five hundred years of enlightenment unwind into a fifteen-year-old body, and the demon begins again — a second chance carried by the Spring Autumn Cicada, and a road the first life never walked."]; }
    else { body=["This chapter’s article awaits the keeper’s hand. The ledger records its place in Volume 1 and the translator’s title."]; }
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
        +'<div class="cap">'+(a.img?'Art: '+esc(a.art||'community artist')+' · community archive — '+esc(a.t)+'.':'Image reserved — the container awaits its artwork.')+'</div></div>';
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
    var h = location.hash || '#main';
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
    if(h==='#main') window.scrollTo(0,0);
  }
  window.addEventListener('hashchange', route);
  route();

  /* ---- random article ---- */
  var rnd = document.getElementById('random-article');
  if(rnd) rnd.addEventListener('click', function(e){
    e.preventDefault();
    var keys = Object.keys(A).filter(function(k){return k.indexOf('atoz')!==0;});
    location.hash = '#/wiki/'+keys[Math.floor(Math.random()*keys.length)];
  });

  /* ---- search ---- */
  var box=document.getElementById('search-box'), input=document.getElementById('search-input'), sug=document.getElementById('search-suggest');
  function toggleSearch(){ box.classList.toggle('open'); if(box.classList.contains('open')) input.focus(); }
  ['search-trigger','rail-search'].forEach(function(id){ var el=document.getElementById(id); if(el) el.addEventListener('click',toggleSearch); });
  document.addEventListener('keydown',function(e){ if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();toggleSearch();} if(e.key==='Escape'){sug.style.display='none';} });
  input.addEventListener('input', function(){
    var q = input.value.trim().toLowerCase();
    if(!q){ sug.style.display='none'; return; }
    var hits = Object.keys(A).filter(function(k){ return A[k].t.toLowerCase().indexOf(q)>-1 || (A[k].k||'').toLowerCase().indexOf(q)>-1; }).slice(0,8);
    if(!hits.length){ sug.style.display='none'; return; }
    sug.innerHTML = hits.map(function(k){ return '<button data-slug="'+k+'"><span>'+esc(A[k].t)+'</span><span class="kind">'+esc(A[k].k||'')+'</span></button>'; }).join('');
    sug.style.display='block';
  });
  sug.addEventListener('click', function(e){
    var b = e.target.closest('button[data-slug]'); if(!b) return;
    location.hash = '#/wiki/'+b.getAttribute('data-slug');
    sug.style.display='none'; box.classList.remove('open'); input.value='';
  });

  /* ---- seal: hover swaps to home (CSS); click scrolls top ---- */
  var seal=document.getElementById('seal-btn');
  if(seal) seal.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });

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
    location.hash='#/wiki/'+keys[Math.floor(Math.random()*keys.length)];
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
    e.preventDefault(); var v=wi.value.trim(); location.hash='#main';
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
