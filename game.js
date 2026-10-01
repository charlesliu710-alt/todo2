const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');
const moneyEl = document.getElementById('money');
const boneCountEl = document.getElementById('boneCount');
const healthFill = document.getElementById('healthFill');
const healthValue = document.getElementById('healthValue');
const survivalTimeEl = document.getElementById('survivalTime');
const bestTimeEl = document.getElementById('bestTime');
const runLabel = document.getElementById('runLabel');
const locationTag = document.getElementById('locationTag');
const bestLabel = document.getElementById('bestLabel');
const statusText = document.getElementById('statusText');
const locationList = document.getElementById('locationList');
const upgradeList = document.getElementById('upgradeList');
const stopButton = document.getElementById('stopButton');
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

const locations = [
  { name: 'The Water Tower', detail: '40m / 6 objects', height: 40, cost: 0, sky: '#a8c8c3', objects: ['AC unit', 'billboard', 'pipe', 'awning', 'scaffold', 'dumpster'] },
  { name: 'Hotel Rooftop', detail: '75m / 9 objects', height: 75, cost: 220, sky: '#d2b7a2', objects: ['neon sign', 'satellite', 'vent', 'balcony', 'pool cover', 'cable', 'awning', 'scaffold', 'dumpster'] },
  { name: 'The Crane', detail: '120m / 12 objects', height: 120, cost: 650, sky: '#9ea5bd', objects: ['hook', 'beam', 'cable', 'cargo', 'catwalk', 'sign', 'pipe', 'vent', 'scaffold', 'awning', 'AC unit', 'dumpster'] },
  { name: 'The Tower', detail: '220m / 28 objects', height: 220, cost: 10000, sky: '#7f93a6', objects: ['antenna', 'dish', 'beam', 'cable', 'window', 'pipe', 'sign', 'vent', 'scaffold', 'AC unit', 'billboard', 'satellite', 'awning', 'cargo', 'catwalk', 'neon sign', 'hook', 'dumpster', 'balcony', 'support', 'ladder', 'water tank', 'flag', 'chute', 'crane arm', 'steel plate', 'spotlight', 'generator'] },
];
const upgradeData = [
  { id: 'luck', name: 'LUCK', detail: 'more objects', baseCost: 100 },
  { id: 'wallet', name: 'PAYOUT', detail: 'bigger cash', baseCost: 160 },
  { id: 'steer', name: 'STEER', detail: 'air control', baseCost: 140 },
  { id: 'helmet', name: 'HELMET', detail: 'bounce once', baseCost: 280 },
  { id: 'jetpack', name: 'JETPACK', detail: 'F to fly', baseCost: 500 },
];
const saved = JSON.parse(localStorage.getItem('brokeABoneSave') || 'null') || { money: 120, unlocked: 0, selected: 0, upgrades: { luck: 0, wallet: 0, steer: 0, helmet: 0 }, best: [0, 0, 0, 0], bestTime: 0, runs: 0 };
saved.upgrades = { luck: 0, wallet: 0, steer: 0, helmet: 0, jetpack: 0, ...saved.upgrades };
saved.best = Array.from({ length: locations.length }, (_, index) => saved.best?.[index] || 0);
const state = { running: false, phase: 'ready', time: 0, last: 0, money: saved.money, bones: 0, health: 100, maxHealth: 100, unlocked: saved.unlocked, selected: saved.selected, upgrades: saved.upgrades, best: saved.best, bestTime: saved.bestTime || 0, run: saved.runs, player: null, objects: [], police: [], particles: [], hitFlash: 0, hitTaken: false, hitSpots: [], shake: 0, nextDropTimer: null };
const keys = {};

function persist() { localStorage.setItem('brokeABoneSave', JSON.stringify({ money: state.money, unlocked: state.unlocked, selected: state.selected, upgrades: state.upgrades, best: state.best, bestTime: state.bestTime, runs: state.run })); }
function moneyFormat(value) { return `$${Math.floor(value)}`; }
function formatTime(seconds) { const minutes = Math.floor(seconds / 60).toString().padStart(2, '0'); const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0'); return `${minutes}:${remainingSeconds}`; }
function updateSurvivalHud() { survivalTimeEl.textContent = formatTime(state.time); bestTimeEl.textContent = `BEST ${formatTime(state.bestTime)}`; }
function updateHealthHud() { const healthPercent = Math.max(0, (state.health / state.maxHealth) * 100); healthFill.style.width = `${healthPercent}%`; healthFill.style.backgroundColor = healthPercent <= 30 ? 'var(--coral)' : healthPercent <= 60 ? 'var(--yellow)' : 'var(--mint)'; healthValue.textContent = `${Math.ceil(healthPercent)}%`; }
function renderShop() {
  moneyEl.textContent = Math.floor(state.money);
  const place = locations[state.selected];
  locationTag.textContent = place.name.toUpperCase();
  bestLabel.textContent = `BEST ${state.best[state.selected]} BONES`;
  locationList.innerHTML = locations.map((location, index) => {
    const locked = index > state.unlocked;
    return `<button class="location-card ${index === state.selected ? 'selected' : ''} ${locked ? 'locked' : ''}" data-location="${index}"><span class="location-name">${location.name}<span class="price">${locked ? moneyFormat(location.cost) : index === state.selected ? 'LIVE' : 'PLAY'}</span></span><span class="location-detail">${location.detail}</span></button>`;
  }).join('');
  upgradeList.innerHTML = upgradeData.map((upgrade) => {
    const level = state.upgrades[upgrade.id];
    const price = Math.round(upgrade.baseCost * Math.pow(1.55, level));
    return `<button class="upgrade-card" data-upgrade="${upgrade.id}"><span class="upgrade-name">${upgrade.name}</span><span class="upgrade-detail">${upgrade.detail}</span><span class="upgrade-level">LV ${level} · ${moneyFormat(price)}</span></button>`;
  }).join('');
  locationList.querySelectorAll('[data-location]').forEach((button) => button.addEventListener('click', () => selectLocation(Number(button.dataset.location))));
  upgradeList.querySelectorAll('[data-upgrade]').forEach((button) => button.addEventListener('click', () => buyUpgrade(button.dataset.upgrade)));
}
function selectLocation(index) { const location = locations[index]; if (index > state.unlocked && state.money >= location.cost) { state.money -= location.cost; state.unlocked = index; } if (index <= state.unlocked) { state.selected = index; persist(); renderShop(); } }
function buyUpgrade(id) { const upgrade = upgradeData.find((item) => item.id === id); const level = state.upgrades[id]; const price = Math.round(upgrade.baseCost * Math.pow(1.55, level)); if (state.money >= price) { state.money -= price; state.upgrades[id] += 1; persist(); renderShop(); } }
function launch() {
  if (state.nextDropTimer) { clearTimeout(state.nextDropTimer); state.nextDropTimer = null; }
  state.running = true; state.phase = 'falling'; state.time = 0; state.run += 1; state.bones = 0; state.health = state.maxHealth; state.hitFlash = 0; state.hitTaken = false; state.hitSpots = []; state.shake = 0; updateSurvivalHud(); updateHealthHud();
  const location = locations[state.selected];
  state.player = { x: canvas.width / 2, y: 78, vx: 0, vy: 35, r: 15, rotation: 0, helmetUsed: false, stallTimer: 0, fuel: state.upgrades.jetpack * 35 };
  state.police = [];
  const count = location.objects.length + state.upgrades.luck * 2;
  state.objects = Array.from({ length: count }, (_, index) => ({ x: 120 + Math.random() * 720, y: 145 + index * ((480 - 145) / Math.max(1, count - 1)) + (Math.random() - .5) * 25, w: 62 + Math.random() * 35, h: 17 + Math.random() * 12, rotation: (Math.random() - .5) * .45, name: location.objects[index % location.objects.length], hit: false, color: index % 3 === 0 ? '#f6c945' : index % 3 === 1 ? '#f05d4e' : '#27313a' }));
  state.particles = []; statusText.textContent = 'AIM FOR THE BAD STUFF'; runLabel.textContent = `RUN ${String(state.run).padStart(2, '0')}`; overlay.classList.remove('visible'); persist();
}
function finish(cause = 'ground') { if (!state.running) return; state.phase = 'dead'; state.running = false; const payout = state.bones * (20 + state.upgrades.wallet * 12); state.money += payout; state.best[state.selected] = Math.max(state.best[state.selected], state.bones); state.bestTime = Math.max(state.bestTime, state.time); const hitGround = cause === 'ground'; statusText.textContent = `${hitGround ? 'HIT THE GROUND' : 'OUT OF HEALTH'} · SURVIVED ${formatTime(state.time)}`; persist(); renderShop(); document.querySelector('.start-card h2').innerHTML = hitGround ? 'YOU HIT<br /><em>THE GROUND.</em>' : 'OUT OF<br /><em>HEALTH.</em>'; document.querySelector('.start-card p').textContent = `You survived ${formatTime(state.time)} and broke ${state.bones} bones. Try to beat your best time.`; startButton.innerHTML = 'TRY AGAIN <span>→</span>'; setTimeout(() => overlay.classList.add('visible'), 350); }
function stopGame() { if (state.nextDropTimer) { clearTimeout(state.nextDropTimer); state.nextDropTimer = null; } state.running = false; state.phase = 'stopped'; state.bestTime = Math.max(state.bestTime, state.time); updateSurvivalHud(); persist(); statusText.textContent = `STOPPED · SURVIVED ${formatTime(state.time)}`; }
function die() { if (!state.running) return; state.running = false; state.phase = 'dead'; state.police = []; statusText.textContent = 'CAUGHT · RUN OVER'; document.querySelector('.start-card h2').innerHTML = 'YOU GOT<br /><em>CAUGHT.</em>'; document.querySelector('.start-card p').textContent = 'The police got you before you could reach the ground. Try a different line through the objects.'; startButton.innerHTML = 'RUN AGAIN <span>→</span>'; setTimeout(() => overlay.classList.add('visible'), 350); }
function breakObject(object, bounce = true) { object.hit = true; state.hitTaken = true; const hitLocations = [{ x: 0, y: -16 }, { x: 0, y: -2 }, { x: -10, y: 7 }, { x: 10, y: 7 }, { x: -7, y: 24 }, { x: 7, y: 24 }]; state.hitSpots.push(hitLocations[Math.floor(Math.random() * hitLocations.length)]); state.health = Math.max(0, state.health - 5); updateHealthHud(); state.bones += 1; state.money += 5 + state.upgrades.wallet * 3; state.hitFlash = .26; state.shake = .22; if (bounce) { state.player.vy = -200; state.player.stallTimer = .2; } for (let i = 0; i < 14; i++) state.particles.push({ x: object.x, y: object.y, vx: (Math.random() - .5) * 180, vy: (Math.random() - .5) * 150, life: .5 + Math.random() * .3, color: i % 2 ? '#f05d4e' : '#f6c945' }); for (let i = 0; i < 12; i++) state.particles.push({ x: state.player.x, y: state.player.y, vx: (Math.random() - .5) * 220, vy: (Math.random() - .5) * 220, life: .45 + Math.random() * .35, color: '#b7193f' }); boneCountEl.textContent = `${state.bones} BONE${state.bones === 1 ? '' : 'S'}`; moneyEl.textContent = Math.floor(state.money); if (state.health === 0) finish('health'); }
function smashDown() { const player = state.player; const targets = state.objects.filter((object) => !object.hit && object.y > player.y && object.y - player.y < 180).sort((first, second) => first.y - second.y).slice(0, 5); let smashed = 0; for (const object of targets) { if (!state.running) break; breakObject(object); smashed += 1; } if (smashed > 0 && state.running) { player.vy = 235; player.stallTimer = 0; state.shake = .3; statusText.textContent = `SMASHED ${smashed} OBJECT${smashed === 1 ? '' : 'S'}`; } }
function update(dt) {
  if (!state.running) return;
  const player = state.player; const steer = 360 + state.upgrades.steer * 55;
  for (const officer of state.police) { const dx = player.x - officer.x; const dy = player.y - officer.y; const distance = Math.hypot(dx, dy) || 1; officer.x += (dx / distance) * officer.speed * dt; officer.y += (dy / distance) * officer.speed * dt; officer.siren += dt * 9; if (distance < player.r + officer.r) { die(); return; } }
  if (keys.a || keys.arrowleft) player.vx -= steer * dt; if (keys.d || keys.arrowright) player.vx += steer * dt; player.vx *= Math.pow(.018, dt); player.x += player.vx * dt; player.x = Math.max(35, Math.min(canvas.width - 35, player.x)); player.stallTimer = Math.max(0, player.stallTimer - dt); if (player.stallTimer === 0) { const flying = state.upgrades.jetpack > 0 && keys.f && player.fuel > 0; if (flying) { player.vy = -120; player.fuel = Math.max(0, player.fuel - (22 + state.upgrades.jetpack * 4) * dt); statusText.textContent = `JETPACK · ${Math.ceil(player.fuel)}% FUEL`; } else { player.vy += 125 * dt; if (state.upgrades.jetpack > 0) { player.fuel = Math.min(state.upgrades.jetpack * 35, player.fuel + (5 + state.upgrades.jetpack) * dt); if (keys.f && player.fuel <= 0) statusText.textContent = 'OUT OF FUEL'; } } player.vy = Math.min(player.vy, 235); player.y += player.vy * dt; } state.time += dt;
  for (const object of state.objects) { if (!object.hit && player.y + player.r > object.y - object.h && player.y - player.r < object.y + object.h && Math.abs(player.x - object.x) < object.w / 2 + player.r) breakObject(object); if (!state.running) return; }
  for (let i = state.particles.length - 1; i >= 0; i--) { const particle = state.particles[i]; particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vy += 200 * dt; particle.life -= dt; if (particle.life <= 0) state.particles.splice(i, 1); }
  state.time += dt; updateSurvivalHud(); state.money += 12 * dt; moneyEl.textContent = Math.floor(state.money); state.hitFlash = Math.max(0, state.hitFlash - dt); state.shake = Math.max(0, state.shake - dt); const groundY = canvas.height - 32 - player.r; if (player.y >= groundY) { player.y = groundY; player.vy = 0; finish(); return; }
}

function draw() {
  const location = locations[state.selected]; const shakeX = (Math.random() - .5) * state.shake * 22; const shakeY = (Math.random() - .5) * state.shake * 22; ctx.save(); ctx.translate(shakeX, shakeY); ctx.fillStyle = location.sky; ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);
  ctx.fillStyle = 'rgba(255,255,255,.24)'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(90 + i * 165, 85 + (i % 2) * 48, 70, 11, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = 'rgba(39,49,58,.13)'; ctx.lineWidth = 1; for (let x = 0; x < canvas.width; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 125, canvas.height); ctx.stroke(); }
  ctx.fillStyle = '#27313a'; ctx.fillRect(0, canvas.height - 32, canvas.width, 45); ctx.fillStyle = '#f05d4e'; ctx.fillRect(0, canvas.height - 32, canvas.width, 3);
  for (const object of state.objects) { if (object.hit) continue; ctx.save(); ctx.translate(object.x, object.y); ctx.rotate(object.rotation); ctx.fillStyle = 'rgba(16,24,32,.18)'; ctx.fillRect(-object.w / 2 + 5, -object.h / 2 + 6, object.w, object.h); ctx.fillStyle = object.color; ctx.fillRect(-object.w / 2, -object.h / 2, object.w, object.h); ctx.strokeStyle = '#101820'; ctx.lineWidth = 2; ctx.strokeRect(-object.w / 2, -object.h / 2, object.w, object.h); ctx.fillStyle = object.color === '#27313a' ? '#f5f1e9' : '#101820'; ctx.font = '9px DM Mono'; ctx.textAlign = 'center'; ctx.fillText(object.name.toUpperCase(), 0, 3); ctx.restore(); }
  for (const officer of state.police) { ctx.save(); ctx.translate(officer.x, officer.y); ctx.fillStyle = '#164a72'; ctx.beginPath(); ctx.arc(0, 0, officer.r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = Math.sin(officer.siren) > 0 ? '#f05d4e' : '#f5f1e9'; ctx.fillRect(-10, -22, 20, 5); ctx.fillStyle = '#f5f1e9'; ctx.fillRect(-5, -3, 10, 5); ctx.strokeStyle = '#101820'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
  for (const particle of state.particles) { ctx.globalAlpha = Math.min(1, particle.life * 2); ctx.fillStyle = particle.color; ctx.fillRect(particle.x, particle.y, 5, 5); } ctx.globalAlpha = 1;
  if (state.player && state.phase !== 'ready') { const player = state.player; ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.rotation); if (state.upgrades.jetpack > 0 && keys.f && player.fuel > 0) { const flameLength = 21 + Math.sin(state.time * 35) * 5; ctx.fillStyle = '#f05d4e'; ctx.beginPath(); ctx.moveTo(-8, 14); ctx.lineTo(0, 14 + flameLength); ctx.lineTo(8, 14); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#f6c945'; ctx.beginPath(); ctx.moveTo(-4, 14); ctx.lineTo(0, 10 + flameLength * .72); ctx.lineTo(4, 14); ctx.closePath(); ctx.fill(); } ctx.strokeStyle = '#101820'; ctx.fillStyle = '#f5f1e9'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -16, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 17); ctx.moveTo(0, 0); ctx.lineTo(-14, 9); ctx.moveTo(0, 0); ctx.lineTo(14, 9); ctx.moveTo(0, 17); ctx.lineTo(-11, 31); ctx.moveTo(0, 17); ctx.lineTo(11, 31); ctx.stroke(); for (const hitSpot of state.hitSpots) { ctx.fillStyle = '#f05d4e'; ctx.beginPath(); ctx.arc(hitSpot.x, hitSpot.y, 3, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
  if (state.player && state.phase !== 'ready' && state.upgrades.jetpack > 0) { const fuelRatio = state.player.fuel / (state.upgrades.jetpack * 35); ctx.fillStyle = 'rgba(16,24,32,.7)'; ctx.fillRect(18, 18, 130, 18); ctx.fillStyle = '#f6c945'; ctx.fillRect(21, 21, 124 * fuelRatio, 12); ctx.fillStyle = '#f5f1e9'; ctx.font = '10px DM Mono'; ctx.textAlign = 'left'; ctx.fillText('FUEL', 154, 31); }
  if (state.phase === 'ready') { ctx.fillStyle = 'rgba(16,24,32,.55)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#f5f1e9'; ctx.font = '500 13px DM Mono'; ctx.textAlign = 'center'; ctx.fillText('PRESS SPACE OR START TO DROP', canvas.width / 2, canvas.height / 2); }
  if (state.hitFlash > 0) { ctx.fillStyle = `rgba(240, 93, 78, ${state.hitFlash * .8})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.restore();
}
function loop(timestamp) { const dt = Math.min((timestamp - state.last) / 1000 || .016, .033); state.last = timestamp; update(dt); draw(); requestAnimationFrame(loop); }
window.addEventListener('keydown', (event) => { const key = event.key.toLowerCase(); keys[key] = true; if (key === 'l' && !event.repeat && state.running) smashDown(); if (event.code === 'Space') { event.preventDefault(); if (!state.running) launch(); } });
window.addEventListener('keyup', (event) => { keys[event.key.toLowerCase()] = false; });
canvas.addEventListener('mousemove', (event) => { const bounds = canvas.getBoundingClientRect(); mouse.x = ((event.clientX - bounds.left) / bounds.width) * canvas.width; mouse.y = ((event.clientY - bounds.top) / bounds.height) * canvas.height; if (state.player) state.player.rotation = Math.atan2(mouse.y - state.player.y, mouse.x - state.player.x); });
startButton.addEventListener('click', launch); stopButton.addEventListener('click', stopGame); renderShop(); boneCountEl.textContent = '0 BONES'; requestAnimationFrame(loop);
