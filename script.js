javascript
// Simple, lightweight JS to drive navigation, envelope animation, audio player and replay logic
(function(){
  const pages = ['page1','page2','page3','page4','page5'];
  const audio = document.getElementById('global-audio');
  let currentTrack = null;
  let envelopeAnimating = false;

  function showSection(id){
    pages.forEach(p=>document.getElementById(p).classList.add('hidden'));
    const el = document.getElementById(id);
    el.classList.remove('hidden');
    // Focus heading for accessibility
    const heading = el.querySelector('.page-heading') || el.querySelector('.title') || el.querySelector('h2');
    if(heading){ heading.tabIndex = -1; heading.focus(); }
  }

  // initial
  showSection('page1');

  // Page 1 -> 2
  document.getElementById('toPage2').addEventListener('click',()=>{
    showSection('page2');
  });

  // Envelope open animation
  const envelope = document.getElementById('envelope');
  const envelopeFlap = document.getElementById('envelope-flap');
  const letter = document.getElementById('letter');
  const confetti = document.getElementById('confetti');
  const openBtn = document.getElementById('openLetterBtn');
  const skipBtn = document.getElementById('skipEnvelope');

  function playEnvelopeAnimation(){
    if(envelopeAnimating) return;
    envelopeAnimating = true;
    // open
    envelope.classList.add('open');
    // show letter after brief delay
    setTimeout(()=>{
      letter.classList.remove('hidden');
      letter.classList.add('show');
      // confetti simple particles: create small dots
      for(let i=0;i<16;i++){
        const el = document.createElement('span');
        el.className = 'confetti-piece';
        el.style.position='absolute';
        el.style.width='8px'; el.style.height='8px';
        el.style.left=(30+Math.random()*200)+'px';
        el.style.top=(10+Math.random()*160)+'px';
        el.style.background=['#ffb3d1','#ffd6e8','#e9d6ff'][Math.floor(Math.random()*3)];
        el.style.borderRadius='4px';
        el.style.opacity='0.95';
        confetti.appendChild(el);
        // fall animation
        el.animate([{transform:'translateY(0) rotate(0deg)',opacity:1},{transform:'translateY(120px) rotate(180deg)',opacity:0}],{duration:1500+Math.random()*1000,delay:Math.random()*200});
      }
    },420);

    // After full animation reveal next button
    setTimeout(()=>{
      const cont = document.createElement('button');
      cont.className='big-btn'; cont.textContent='Continue ♡';
      cont.setAttribute('aria-label','Continue to letter');
      cont.addEventListener('click',()=>{
        showSection('page3');
        // clear confetti
        confetti.innerHTML='';
      });
      // put below envelope
      envelope.parentElement.appendChild(cont);
      envelopeAnimating = false;
    },2400);
  }

  openBtn.addEventListener('click',playEnvelopeAnimation);
  skipBtn.addEventListener('click',()=>{
    // set final state immediately and go to page3
    envelope.classList.add('open');
    letter.classList.remove('hidden');
    letter.classList.add('show');
    confetti.innerHTML='';
    showSection('page3');
  });

  // Page 3 -> 4
  document.getElementById('toPage4').addEventListener('click',()=>{
    showSection('page4');
  });

  // Tracks handling
  const trackEls = Array.from(document.querySelectorAll('.track'));
  const nowPlaying = document.getElementById('nowPlaying');
  const playPause = document.getElementById('playPause');
  const seekBar = document.getElementById('seekBar');
  const currentTime = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  const volume = document.getElementById('volume');
  const toPage5 = document.getElementById('toPage5');

  // select track
  function selectTrack(el){
    if(currentTrack && currentTrack !== el){
      // stop previous
      audio.pause(); audio.currentTime = 0;
      currentTrack.classList.remove('selected');
    }
    currentTrack = el;
    el.classList.add('selected');
    const src = el.dataset.src;
    const title = el.dataset.title || 'Track';
    audio.src = src;
    nowPlaying.textContent = `Now Playing: ${title}`;
    updatePlayIcon();
  }

  trackEls.forEach(t=>{
    t.addEventListener('click',()=>selectTrack(t));
    t.addEventListener('keydown',(e)=>{ if(e.key==='Enter' || e.key===' ') selectTrack(t); });
  });

  // play/pause
  playPause.addEventListener('click',()=>{
    if(!audio.src) return; // nothing selected
    if(audio.paused){ audio.play(); } else { audio.pause(); }
    updatePlayIcon();
  });

  function updatePlayIcon(){
    playPause.textContent = audio.paused ? '▶️' : '⏸️';
    if(audio.src && !audio.paused){ nowPlaying.classList.add('playing'); } else { nowPlaying.classList.remove('playing'); }
  }

  // audio events
  audio.addEventListener('loadedmetadata',()=>{
    durationEl.textContent = formatTime(audio.duration);
    seekBar.max = Math.floor(audio.duration);
  });
  audio.addEventListener('timeupdate',()=>{
    seekBar.value = Math.floor(audio.currentTime);
    currentTime.textContent = formatTime(audio.currentTime);
  });
  audio.addEventListener('ended',()=>{ updatePlayIcon(); audio.currentTime = 0; });

  seekBar.addEventListener('input',()=>{ audio.currentTime = seekBar.value; });
  volume.addEventListener('input',()=>{ audio.volume = volume.value; });

  function formatTime(sec){
    if(!sec || isNaN(sec)) return '0:00';
    const s = Math.floor(sec%60).toString().padStart(2,'0');
    const m = Math.floor(sec/60);
    return `${m}:${s}`;
  }

  toPage5.addEventListener('click',()=> showSection('page5'));

  // GIF cards flip (simple reload on click to reset animation later)
  const gifCards = Array.from(document.querySelectorAll('.gif-card'));
  gifCards.forEach(c=>{
    c.addEventListener('click',()=>{
      const img = c.querySelector('.gif');
      // simulate flip by toggling transform
      c.style.transform = 'rotateY(180deg)';
      setTimeout(()=> c.style.transform='rotateY(0deg)',800);
      // no persistent flip; just a little fun
    });
  });

  // Replay implementation
  const replayBtn = document.getElementById('replayBtn');
  replayBtn.addEventListener('click',resetCard);

  function resetCard(){
    // stop audio
    audio.pause(); audio.currentTime = 0; audio.removeAttribute('src'); currentTrack && currentTrack.classList.remove('selected'); currentTrack = null;
    // reset seek
    seekBar.value = 0; currentTime.textContent='0:00'; durationEl.textContent='0:00';
    // reset envelope
    envelope.classList.remove('open');
    letter.classList.add('hidden'); letter.classList.remove('show');
    confetti.innerHTML = '';
    // reset gif images by reloading their src
    const gifs = document.querySelectorAll('.gif');
    gifs.forEach(g=>{ const src = g.src; g.src = ''; setTimeout(()=> g.src = src,50); });
    // remove any dynamically added continue button on envelope
    const cont = document.querySelector('#envelope + .big-btn');
    if(cont) cont.remove();
    // go to page1
    showSection('page1');
    // restart simple animations by reflow
    const photo = document.querySelector('.gf-photo');
    photo.style.animation = 'none';
    void photo.offsetWidth;
    photo.style.animation = '';
  }

  // expose functions for debugging (optional)
  window.showSection = showSection;
  window.resetCard = resetCard;

})();

