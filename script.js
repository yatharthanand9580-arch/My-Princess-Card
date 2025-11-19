/* Princess Day — script.js
   - Controls navigation
   - Envelope animation + skip
   - Playlist (single audio element)
   - Replay/reset
   - GIF flips reset
   - Accessibility: focus moves to next page heading
*/

const sections = {
  page1: document.getElementById('page1'),
  page2: document.getElementById('page2'),
  page3: document.getElementById('page3'),
  page4: document.getElementById('page4'),
  page5: document.getElementById('page5')
};

const audio = document.getElementById('main-audio');
const playBtn = document.getElementById('play-pause');
const seek = document.getElementById('seek');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeEl = document.getElementById('volume'); // <-- keep consistent name
const nowPlaying = document.getElementById('now-playing');
const playerTitle = document.getElementById('player-title');

let tracks = [
  { title: "Tumsa Koi Pyara", artwork: "assets/images/track1.jpg", src: "assets/music/track1.mp3" },
  { title: "Hume Tumse Pyar Kitna", artwork: "assets/images/track2.jpg", src: "assets/music/track2.mp3" },
  { title: "Ye Tune Kya Kiya", artwork: "assets/images/track3.jpg", src: "assets/music/track3.mp3" }
];

let currentTrackIndex = -1;
let isPlaying = false;
let seekUpdating = false;

/* Navigation helpers */
function showSection(id){
  // hide all
  Object.values(sections).forEach(s => s.classList.add('hidden'));
  // show requested
  const sec = sections[id];
  if(sec) {
    sec.classList.remove('hidden');
    // move focus to heading in section for accessibility
    const heading = sec.querySelector('.heading');
    if(heading) heading.focus?.();
  }
}

/* Entry from page1 -> page2 with smooth fade */
function openToPage2(){
  showSection('page2');
}

/* PAGE 2 — Envelope */
const envelope = document.getElementById('envelope');
const flap = document.getElementById('envelope-flap');
const letter = document.getElementById('letter');
const confetti = document.getElementById('confetti');
const openLetterBtn = document.getElementById('open-letter-btn');
const page2Continue = document.getElementById('page2-continue');

let envelopeOpen = false;

function triggerEnvelope(){
  if(envelopeOpen) return;
  openLetterBtn.disabled = true;
  flap.style.transform = 'rotateX(-180deg)'; // open flap
  // reveal letter
  setTimeout(() => {
    letter.classList.remove('hidden');
    letter.style.transform = 'translateY(-30px) rotate(-2deg)';
    // show confetti briefly
    confetti.classList.add('show');
    setTimeout(()=> confetti.classList.remove('show'), 1600);
  }, 500);

  // After full animation -> show continue
  setTimeout(()=>{
    page2Continue.classList.remove('hidden');
    page2Continue.focus();
    envelopeOpen = true;
  }, 2200);
}

function skipToPage3(){
  // instantly set open state (no animation) and go to page 3
  flap.style.transition = 'none';
  letter.style.transition = 'none';
  flap.style.transform = 'rotateX(-180deg)';
  letter.classList.remove('hidden');
  letter.style.transform = 'translateY(-30px) rotate(-2deg)';
  page2Continue.classList.remove('hidden');
  setTimeout(()=> {
    flap.style.transition = '';
    letter.style.transition = '';
    showSection('page3');
  }, 120);
}

/* PAGE 4 — Playlist behavior */
function selectTrack(index){
  if(index === currentTrackIndex){
    // toggle play/pause
    togglePlayPause();
    return;
  }
  // stop previous
  audio.pause();
  audio.currentTime = 0;
  isPlaying = false;
  updatePlayBtn();

  currentTrackIndex = index;
  audio.src = tracks[index].src;
  playerTitle.textContent = tracks[index].title;
  nowPlaying.classList.add('show');

  // highlight selected card
  document.querySelectorAll('.track-card').forEach((el,i)=>{
    el.style.opacity = (i===index) ? '1' : '0.6';
    el.style.transform = (i===index) ? 'scale(1.02)' : 'scale(1)';
  });

  // load meta and play
  audio.load();
  audio.play().then(()=> {
    isPlaying = true;
    updatePlayBtn();
  }).catch(()=> {
    // ignore autoplay block; keep state ready
    isPlaying = false;
    updatePlayBtn();
  });
}

/* Play / Pause */
function togglePlayPause(){
  if(!audio.src){
    // no track selected -> choose first
    selectTrack(0);
    return;
  }
  if(audio.paused){
    audio.play();
    isPlaying = true;
  } else {
    audio.pause();
    isPlaying = false;
  }
  updatePlayBtn();
}

function updatePlayBtn(){
  playBtn.textContent = audio.paused ? '▶' : '⏸';
}

/* Seek & time updates */
audio.addEventListener('loadedmetadata', ()=>{
  durationEl.textContent = formatTime(audio.duration || 0);
  seek.max = Math.floor(audio.duration || 0);
});
audio.addEventListener('timeupdate', ()=>{
  if(!seekUpdating){
    seek.value = Math.floor(audio.currentTime);
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
});
seek.addEventListener('input', ()=> {
  seekUpdating = true;
  currentTimeEl.textContent = formatTime(seek.value);
});
seek.addEventListener('change', ()=>{
  audio.currentTime = seek.value;
  seekUpdating = false;
});
volumeEl.addEventListener('input', ()=> { // <-- fixed variable name
  audio.volume = volumeEl.value;
});

/* When track ends */
audio.addEventListener('ended', ()=>{
  isPlaying = false;
  updatePlayBtn();
  nowPlaying.classList.remove('show');
  // optional: move to next track
  // auto-stop per requirements
});

/* Utility time format */
function formatTime(s){
  s = Math.max(0, Math.floor(s||0));
  const mm = Math.floor(s/60);
  const ss = s%60;
  return `${mm}:${ss.toString().padStart(2,'0')}`;
}

/* PAGE 5 — GIF flip */
function flipGif(card){
  card.classList.toggle('flipped');
  const pressed = card.classList.contains('flipped');
  card.setAttribute('aria-pressed', pressed ? 'true' : 'false');
}

/* REPLAY / RESET functionality */
function resetCard(){
  // Stop & reset audio
  audio.pause();
  audio.currentTime = 0;
  audio.removeAttribute('src');
  currentTrackIndex = -1;
  isPlaying = false;
  updatePlayBtn();
  nowPlaying.classList.remove('show');
  playerTitle.textContent = 'No track selected';
  seek.value = 0;
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = '0:00';
  // reset track card styles
  document.querySelectorAll('.track-card').forEach(el=>{
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
  });

  // envelope reset: close flap and hide letter
  flap.style.transition = '';
  flap.style.transform = 'rotateX(0deg)';
  letter.classList.add('hidden');
  letter.style.transform = '';
  confetti.classList.remove('show');
  envelopeOpen = false;
  page2Continue.classList.add('hidden');
  openLetterBtn.disabled = false;

  // reset gif flips
  document.querySelectorAll('.gif-card.flipped').forEach(c => c.classList.remove('flipped'));

  // reset page to page1
  showSection('page1');

  // replay subtle animations (retrigger by toggling class)
  const gf = document.querySelector('.gf-photo');
  if(gf){
    gf.style.animation = 'none';
    void gf.offsetWidth;
    gf.style.animation = '';
  }

  // reset focus
  const heading = sections.page1.querySelector('.heading');
  if(heading) heading.focus?.();
}

/* Ensure keyboard accessibility: Enter on track-card toggles */
document.querySelectorAll('.track-card').forEach(e=>{
  e.addEventListener('keydown',(ev)=>{
    if(ev.key === 'Enter' || ev.key === ' '){
      ev.preventDefault();
      e.click();
    }
  });
});

/* On initial load */
window.addEventListener('load', ()=>{
  showSection('page1');
  // set defaults
  updatePlayBtn();
  volumeEl.value = audio.volume; // <-- use volumeEl
});
