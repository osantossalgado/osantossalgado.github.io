(function(){
  'use strict';

  const tabs = Array.from(document.querySelectorAll('.tab'));
  const content = document.getElementById('content');
  const profileBox = document.getElementById('profileBox');
  const defaultFragment = 'home.html';

  async function loadFragment(url, push=true){
    try{
      const res = await fetch(url, {cache:'no-store'});
      if(!res.ok) throw new Error('Failed to load fragment: ' + res.status);
      const html = await res.text();
      content.innerHTML = html;
      updateProfileVisibility(url);
      if(push){
        const state = { fragment: url };
        history.pushState(state, '', '#' + fragmentName(url));
      }
    }catch(err){
      content.innerHTML = '<div class="terminal">Unable to load content. Check connection.</div>';
      console.error(err);
    }
  }

  function fragmentName(url){
    return url.split('/').pop().replace('.html','');
  }

  function updateActiveTab(targetName){
    tabs.forEach(t=>{
      const isActive = t.dataset.target === targetName;
      t.classList.toggle('active', isActive);
      if(isActive){
        t.setAttribute('aria-current','true');
      } else {
        t.removeAttribute('aria-current');
      }
    });
  }

  function updateProfileVisibility(url){
    const name = fragmentName(url);
    if(name === 'home'){
      profileBox.classList.remove('profile-hidden');
    } else {
      profileBox.classList.add('profile-hidden');
    }
  }

  tabs.forEach(t=>{
    t.addEventListener('click', ()=>{
      const frag = t.dataset.fragment;
      loadFragment(frag);
      updateActiveTab(t.dataset.target);
    });
    t.addEventListener('keydown',(e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); t.click(); }
      if(e.key === 'ArrowRight'){ const idx = (tabs.indexOf(t)+1)%tabs.length; tabs[idx].focus(); }
      if(e.key === 'ArrowLeft'){ const idx = (tabs.indexOf(t)-1+tabs.length)%tabs.length; tabs[idx].focus(); }
    });
  });

  window.addEventListener('popstate', (e)=>{
    const state = e.state;
    if(state && state.fragment){ loadFragment(state.fragment, false); updateActiveTab(fragmentName(state.fragment)); }
    else {
      const hash = location.hash.replace('#','');
      const tab = tabs.find(t=>t.dataset.target === hash);
      if(tab){ loadFragment(tab.dataset.fragment, false); updateActiveTab(hash); }
      else { loadFragment(defaultFragment, false); updateActiveTab('home'); }
    }
  });

  (function initial(){
    const hash = location.hash.replace('#','');
    const tab = tabs.find(t=>t.dataset.target === hash);
    if(tab){ tab.click(); return; }
    const state = history.state;
    if(state && state.fragment){ loadFragment(state.fragment, false); updateActiveTab(fragmentName(state.fragment)); return; }
    loadFragment(defaultFragment, false);
    updateActiveTab('home');
  })();

  (function matrixCanvas(){
    const canvas = document.querySelector('canvas.matrix');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, columns, drops;
    const letters = 'アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const fontSize = 16;

    function resize(){
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = new Array(columns).fill(1);
    }
    function draw(){
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle = '#00ff00';
      ctx.font = fontSize + 'px monospace';
      for(let i=0;i<drops.length;i++){
        const text = letters[Math.floor(Math.random()*letters.length)];
        ctx.fillText(text, i*fontSize, drops[i]*fontSize);
        if(drops[i]*fontSize > height && Math.random() > 0.975) drops[i]=0;
        drops[i]++;
      }
    }
    let interval = null;
    function start(){ if(interval) return; interval = setInterval(draw,33); }
    function stop(){ clearInterval(interval); interval=null; }

    document.addEventListener('visibilitychange', ()=>{ document.hidden ? stop() : start(); });
    window.addEventListener('resize', resize);
    resize(); start();
  })();

})();
