'use strict';
// Clean Water Run — Project 6 final version. No third-party JavaScript required.
const MODES = {
  easy:   {label:'Easy', seconds:45, goal:150, lives:4, speed:145, spawn:650, dirtyChance:.18},
  normal: {label:'Normal',seconds:30, goal:200, lives:3, speed:205, spawn:470, dirtyChance:.25},
  hard:   {label:'Hard', seconds:25, goal:250, lives:2, speed:280, spawn:340, dirtyChance:.32}
};
const $ = id => document.getElementById(id);
const el = {area:$('gameArea'),drops:$('drops'),effects:$('effects'),player:$('player'),overlay:$('overlay'),score:$('score'),time:$('time'),lives:$('lives'),progress:$('progressFill'),track:$('progressTrack'),progressText:$('progressText'),milestone:$('milestone'),goalHint:$('goalHint'),modeDetails:$('modeDetails'),modalIcon:$('modalIcon'),modalTitle:$('modalTitle'),modalText:$('modalText'),start:$('startBtn'),reset:$('resetBtn'),sound:$('soundBtn')};
let mode='normal', score=0, lives=3, remaining=30, running=false, finished=false;
let drops=[], playerX=.5, keyDir=0, lastFrame=0, spawnAccumulator=0, timerAccumulator=0, raf=0;
let audioEnabled=true, audioContext=null, milestoneSeen=new Set();
const milestones=[{fraction:.25,text:'💧 Great start! 25% of your clean-water goal!'},{fraction:.5,text:'🌊 Halfway there! Keep collecting clean water!'},{fraction:.75,text:'💛 Almost there! 75% of your goal reached!'},{fraction:1,text:'🏆 Goal reached! Clean Water Champion!'}];
function sound(kind){
  if(!audioEnabled)return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    audioContext=audioContext||new AC();if(audioContext.state==='suspended')audioContext.resume();
    const now=audioContext.currentTime, osc=audioContext.createOscillator(), gain=audioContext.createGain();
    osc.type=kind==='bad'?'sawtooth':'sine';
    const tones={good:[660,920,.10],bad:[250,140,.17],win:[520,1050,.45],click:[400,550,.07],lose:[330,180,.32]};
    const [from,to,duration]=tones[kind]||tones.click;
    osc.frequency.setValueAtTime(from,now);osc.frequency.exponentialRampToValueAtTime(to,now+duration);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.10,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+duration+.01);
  }catch(e){/* audio unavailable: gameplay still works */}
}
function config(){return MODES[mode]}
function showModal(icon,title,description,button){el.modalIcon.textContent=icon;el.modalTitle.textContent=title;el.modalText.textContent=description;el.start.textContent=button;el.overlay.classList.remove('hidden')}
function hideModal(){el.overlay.classList.add('hidden')}
function updateHUD(){const c=config();el.score.textContent=score;el.time.textContent=remaining+'s';el.lives.textContent=lives?'❤️ '.repeat(lives).trim():'♡';el.lives.setAttribute('aria-label',lives+' lives remaining');el.progress.style.width=Math.min(100,score/c.goal*100)+'%';el.progressText.textContent=score+' / '+c.goal+' points';el.track.setAttribute('aria-valuemax',c.goal);el.track.setAttribute('aria-valuenow',Math.min(c.goal,score));el.goalHint.textContent='Goal: '+c.goal+' points'}
function resetState(){cancelAnimationFrame(raf);running=false;finished=false;score=0;lives=config().lives;remaining=config().seconds;playerX=.5;keyDir=0;lastFrame=0;spawnAccumulator=0;timerAccumulator=0;milestoneSeen.clear();drops.forEach(d=>d.node.remove());drops=[];el.effects.replaceChildren();el.milestone.textContent='Collect blue drops (+10). Avoid brown drops (−10 and −1 life).';el.milestone.classList.remove('pop');positionPlayer();updateHUD()}
function selectMode(next){if(!MODES[next])return;mode=next;document.querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});const c=config();el.modeDetails.textContent=`${c.seconds}s · ${c.goal}-point goal · ${c.lives} lives`;resetState();showModal('💧',`${c.label} mode selected`,'Catch clean drops, avoid pollution, and reach your goal before time runs out.','Start Game →')}
function positionPlayer(){const w=el.area.clientWidth||800,playerW=el.player.offsetWidth||72;el.player.style.left=Math.max(0,Math.min(w-playerW,playerX*w-playerW/2))+'px'}
function movePointer(event){if(!running)return;const rect=el.area.getBoundingClientRect();playerX=Math.max(.05,Math.min(.95,(event.clientX-rect.left)/rect.width));positionPlayer()}
function spawnDrop(){const dirty=Math.random()<config().dirtyChance,node=document.createElement('div');node.className='drop'+(dirty?' dirty':'');node.textContent=dirty?'🟤':'💧';node.setAttribute('aria-hidden','true');const x=12+Math.random()*Math.max(10,el.area.clientWidth-45);node.style.left=x+'px';node.style.top='-45px';el.drops.appendChild(node);drops.push({node,x,y:-45,dirty,speed:config().speed*(.85+Math.random()*.4)})}
function floatText(x,y,label,bad){const node=document.createElement('div');node.className='float-text '+(bad?'bad':'good');node.textContent=label;node.style.left=x+'px';node.style.top=y+'px';el.effects.appendChild(node);setTimeout(()=>node.remove(),680)}
function milestoneCheck(){const fraction=score/config().goal;for(const m of milestones){if(fraction>=m.fraction&&!milestoneSeen.has(m.fraction)){milestoneSeen.add(m.fraction);el.milestone.textContent=m.text;el.milestone.classList.remove('pop');void el.milestone.offsetWidth;el.milestone.classList.add('pop')}}}
function collect(drop){drop.node.remove();drops=drops.filter(d=>d!==drop);if(drop.dirty){score=Math.max(0,score-10);lives--;floatText(drop.x,drop.y,'−10 💔',true);sound('bad')}else{score+=10;floatText(drop.x,drop.y,'+10',false);sound('good')}updateHUD();milestoneCheck();if(score>=config().goal)finish(true);else if(lives<=0)finish(false,'lives')}
function celebrate(){const colors=['#ffc907','#ffffff','#0e86c2','#fb8e4c','#56c9ae'];for(let i=0;i<65;i++){const node=document.createElement('div');node.className='confetti';node.style.left=(Math.random()*100)+'%';node.style.top=(-10-Math.random()*120)+'px';node.style.background=colors[i%colors.length];node.style.animationDelay=(Math.random()*.45)+'s';el.effects.appendChild(node);setTimeout(()=>node.remove(),2400)}}
function finish(win,reason){if(finished)return;finished=true;running=false;cancelAnimationFrame(raf);if(win){sound('win');celebrate();showModal('🏆','Clean Water Champion! 🎉',`Amazing! You reached ${config().goal} points on ${config().label} mode with ${remaining}s left. Keep making every drop count!`,'Play Again →')}else{sound('lose');showModal('💧','Keep trying!',reason==='lives'?'You ran out of lives. Avoid polluted drops and try again!':'Time is up! You can do it—give it another try.','Try Again →')}}
function tick(ts){if(!running)return;if(!lastFrame)lastFrame=ts;const dt=Math.min((ts-lastFrame)/1000,.05);lastFrame=ts;const c=config();if(keyDir){playerX=Math.max(.05,Math.min(.95,playerX+keyDir*dt*.85));positionPlayer()}
  spawnAccumulator+=dt*1000;timerAccumulator+=dt*1000;
  while(spawnAccumulator>=c.spawn){spawnAccumulator-=c.spawn;spawnDrop()}
  while(timerAccumulator>=1000){timerAccumulator-=1000;remaining=Math.max(0,remaining-1);updateHUD();if(remaining===0){finish(false,'time');return}}
  const px=el.player.offsetLeft,py=el.player.offsetTop,pw=el.player.offsetWidth,ph=el.player.offsetHeight;
  for(const d of [...drops]){d.y+=d.speed*dt;d.node.style.transform=`translateY(${d.y+45}px)`;const dx=d.x,dy=d.y;
    if(dx+24>px+7&&dx<px+pw-7&&dy+32>py+5&&dy<py+ph-8){collect(d);if(!running)return}
    else if(dy>el.area.clientHeight){d.node.remove();drops=drops.filter(x=>x!==d)}
  }
  raf=requestAnimationFrame(tick)
}
function start(){resetState();running=true;hideModal();sound('click');el.area.focus({preventScroll:true});raf=requestAnimationFrame(tick)}
el.start.addEventListener('click',start);
el.reset.addEventListener('click',()=>{sound('click');resetState();showModal('💧','Ready for another run?','Choose your difficulty and collect clean water!','Start Game →')});
el.sound.addEventListener('click',()=>{audioEnabled=!audioEnabled;el.sound.textContent=audioEnabled?'🔊 Sound On':'🔇 Sound Off';el.sound.setAttribute('aria-pressed',String(audioEnabled));if(audioEnabled)sound('click')});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{sound('click');selectMode(b.dataset.mode)}));
window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){if(running){e.preventDefault();keyDir=e.key==='ArrowLeft'?-1:1}}});
window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'&&keyDir<0||e.key==='ArrowRight'&&keyDir>0)keyDir=0});
window.addEventListener('blur',()=>{keyDir=0});
el.area.addEventListener('pointerdown',e=>{if(running){el.area.setPointerCapture?.(e.pointerId);movePointer(e)}});
el.area.addEventListener('pointermove',e=>{if(running&&(e.pointerType==='mouse'||e.buttons))movePointer(e)});
window.addEventListener('resize',positionPlayer);
selectMode('normal');
