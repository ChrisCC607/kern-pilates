/* KERN — shared interactions. Progressive: nothing here is required to read the page. */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO  = 'IntersectionObserver' in window;

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (reduce || !hasIO){
    reveals.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }});
    }, {threshold:0.16, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });

    document.querySelectorAll('.benefit').forEach(function(el){
      var bo = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); bo.unobserve(e.target); }});
      }, {threshold:0.35});
      bo.observe(el);
    });
  }

  /* ---- count-up ---- */
  function countUp(el){
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suf = el.getAttribute('data-suffix') || '';
    if (reduce){ el.innerHTML = target + (suf?'<span class="suf">'+suf+'</span>':''); return; }
    var dur = 1200, start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts - start)/dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.innerHTML = Math.round(target * eased) + (suf?'<span class="suf">'+suf+'</span>':'');
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var nums = document.querySelectorAll('[data-count]');
  if (!hasIO || reduce){
    nums.forEach(function(el){ var suf=el.getAttribute('data-suffix')||''; el.innerHTML = el.getAttribute('data-count') + (suf?'<span class="suf">'+suf+'</span>':''); });
  } else {
    var no = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ countUp(e.target); no.unobserve(e.target); }});
    }, {threshold:0.6});
    nums.forEach(function(el){ el.textContent = '0'; no.observe(el); });
  }

  /* ---- nav shrink on scroll ---- */
  var nav = document.querySelector('.nav');
  if (nav){
    var onScroll = function(){ nav.classList.toggle('shrunk', window.scrollY > 40); };
    onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
  }

  if (reduce) return; /* everything below is pure motion polish */

  /* ---- magnetic buttons ---- */
  document.querySelectorAll('[data-magnetic]').forEach(function(btn){
    btn.addEventListener('mousemove', function(e){
      var r = btn.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width/2) * 0.25;
      var y = (e.clientY - r.top - r.height/2) * 0.35;
      btn.style.transform = 'translate('+x+'px,'+y+'px)';
    });
    btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
  });

  /* ---- desktop cursor crosshair ---- */
  if (window.matchMedia('(pointer:fine)').matches){
    var xh = document.createElement('div');
    xh.className = 'cursor-xh';
    xh.innerHTML = '<svg viewBox="0 0 26 26" aria-hidden="true"><line x1="13" y1="0" x2="13" y2="26"/><line x1="0" y1="13" x2="26" y2="13"/></svg>';
    document.body.appendChild(xh);
    var tx=0,ty=0,cx=0,cy=0,raf;
    document.addEventListener('mousemove', function(e){
      tx=e.clientX; ty=e.clientY; xh.classList.add('on');
      if(!raf) raf = requestAnimationFrame(follow);
    });
    document.addEventListener('mouseleave', function(){ xh.classList.remove('on'); });
    function follow(){
      cx += (tx-cx)*0.35; cy += (ty-cy)*0.35;
      xh.style.left = cx+'px'; xh.style.top = cy+'px';
      raf = requestAnimationFrame(follow);
    }
    var interactive = 'a,button,summary,input,[data-magnetic]';
    document.addEventListener('mouseover', function(e){ if(e.target.closest(interactive)) xh.classList.add('tap'); });
    document.addEventListener('mouseout',  function(e){ if(e.target.closest(interactive)) xh.classList.remove('tap'); });
  }
})();
