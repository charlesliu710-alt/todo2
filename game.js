const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const healthFill = document.getElementById('healthFill');
const scoreEl = document.getElementById('score');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');
const invincibleToggle = document.getElementById('invincibleToggle');
const damageSlider = document.getElementById('damageSlider');
const speedSlider = document.getElementById('speedSlider');
const enemySpeedSlider = document.getElementById('enemySpeedSlider');
const damageLabel = document.getElementById('damageLabel');
const speedLabel = document.getElementById('speedLabel');
const enemySpeedLabel = document.getElementById('enemySpeedLabel');
const waveDisplay = document.getElementById('waveDisplay');

let damageMultiplier = 1;
let speedMultiplier = 1;
let enemySpeedMultiplier = 1;

const WORLD = { width: 1800, height: 1200 };
const keys = {};
const mouse = { x: canvas.width / 2, y: canvas.height / 2, down: false };

const player = {
  x: WORLD.width / 2,
  y: WORLD.height / 2,
  radius: 18,
  speed: 240,
  health: 100,
  maxHealth: 100,
  armor: 30,
  armorMax: 30,
  facing: 0,
  attackCooldown: 0,
  attackTimer: 0,
  invulnTimer: 0,
  hitFlash: 0,
  score: 0,
  combo: 0,
  comboTimer: 0,
};

const enemies = [];
const particles = [];
const medkits = [];
let running = false;
let lastTime = 0;
let medkitSpawnTimer = 0;
let screenShake = 0;
let wave = 1;

function resetGame() {
  player.x = WORLD.width / 2;
  player.y = WORLD.height / 2;
  player.health = player.maxHealth;
  player.attackTimer = 0;
  player.invulnTimer = 0;
  player.score = 0;
  scoreEl.textContent = 'Kills: 0';
  healthFill.style.width = '100%';

  enemies.length = 0;
  particles.length = 0;
  medkits.length = 0;
  medkitSpawnTimer = 2;
  screenShake = 0;
  wave = 1;
  spawnWave();
}

function spawnWave() {
  const normalCount = 8 + wave * 2;
  for (let i = 0; i < normalCount; i++) {
    spawnEnemy(false);
  }

  const boss = spawnEnemy(true);
  if (boss) {
    boss.x = WORLD.width / 2 + 50;
    boss.y = WORLD.height / 2 - 50;
  }
  updateWaveDisplay();
}

function spawnMedkit() {
  const x = 50 + Math.random() * (WORLD.width - 100);
  const y = 50 + Math.random() * (WORLD.height - 100);
  medkits.push({
    x,
    y,
    radius: 14,
    heal: 30,
    life: 12 + Math.random() * 8,
    bob: Math.random() * Math.PI * 2,
  });
}

function spawnEnemy(forceBoss = false) {
  const side = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;

  if (side === 0) {
    x = Math.random() * WORLD.width;
    y = -40;
  } else if (side === 1) {
    x = WORLD.width + 40;
    y = Math.random() * WORLD.height;
  } else if (side === 2) {
    x = Math.random() * WORLD.width;
    y = WORLD.height + 40;
  } else {
    x = -40;
    y = Math.random() * WORLD.height;
  }

  const difficulty = Math.min(10, Math.floor(player.score / 3));
  const isBoss = forceBoss || (player.score >= 10 && Math.random() < 0.2);
  const health = isBoss ? 45 + difficulty * 4 : 30 + difficulty * 10;
  const enemy = {
    x,
    y,
    radius: isBoss ? 26 + difficulty * 1.4 : 16 + difficulty * 1.2,
    speed: isBoss ? 75 + difficulty * 12 : 90 + difficulty * 18 + Math.random() * 35,
    health,
    maxHealth: health,
    attackCooldown: isBoss ? 1.2 : 0.9,
    attackTimer: 0,
    isBoss,
    color: isBoss ? '#ff8c42' : `hsl(${Math.random() * 40 + 5}, 70%, ${55 - difficulty * 2}%)`,
  };

  enemies.push(enemy);
  return enemy;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateHud() {
  const pct = clamp(player.health / player.maxHealth, 0, 1);
  healthFill.style.width = `${pct * 100}%`;
  scoreEl.textContent = `Kills: ${player.score}`;
}

function startGame() {
  running = true;
  overlay.classList.remove('visible');
  resetGame();
}

function endGame() {
  running = false;
  overlay.classList.add('visible');
  overlay.querySelector('h1').textContent = 'You Died';
  overlay.querySelector('p:nth-of-type(1)').textContent = `Final score: ${player.score}`;
  overlay.querySelector('p:nth-of-type(2)').textContent = 'Press the button to fight again';
  overlay.querySelector('p:nth-of-type(3)').textContent = 'WASD + click/Space';
  startButton.textContent = 'Restart';
}

function attack() {
  if (!running) return;

  player.attackTimer = player.attackCooldown;
  screenShake = Math.max(screenShake, 0.18);

  const angle = player.facing;
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  for (let i = 0; i < 14; i++) {
    particles.push({
      x: player.x + Math.cos(angle + ((i / 14) - 0.5) * 1.8) * 28,
      y: player.y + Math.sin(angle + ((i / 14) - 0.5) * 1.8) * 28,
      vx: Math.cos(angle + ((i / 14) - 0.5) * 1.4) * 90,
      vy: Math.sin(angle + ((i / 14) - 0.5) * 1.4) * 90,
      life: 0.25,
      color: '#f8d66d',
    });
  }

  const reachToWall = 180;

  for (const enemy of enemies) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= 180) {
      enemy.health -= 50 * damageMultiplier;
      enemy.x += (dx / Math.max(dist, 0.001)) * 26 + dirX * 18;
      enemy.y += (dy / Math.max(dist, 0.001)) * 26 + dirY * 18;

      for (let i = 0; i < 8; i++) {
        particles.push({
          x: enemy.x,
          y: enemy.y,
          vx: (Math.random() - 0.5) * 80,
          vy: (Math.random() - 0.5) * 80,
          life: 0.4,
          color: '#f4d35e',
        });
      }

      if (enemy.health <= 0) {
        player.combo += 1;
        player.comboTimer = 4.0;
        let scoreGain = 1 + Math.floor(player.combo / 5) * 0.5;
        player.score += scoreGain;

        if (enemies.filter((e) => e.isBoss).length === 0 && enemies.length <= 1) {
          wave += 1;
          spawnWave();
        } else {
          spawnEnemy();
        }
      }
    }
  }
}

function handleInput(dt) {
  let moveX = 0;
  let moveY = 0;

  if (keys['w'] || keys['arrowup']) moveY -= 1;
  if (keys['s'] || keys['arrowdown']) moveY += 1;
  if (keys['a'] || keys['arrowleft']) moveX -= 1;
  if (keys['d'] || keys['arrowright']) moveX += 1;

  if (moveX !== 0 || moveY !== 0) {
    const len = Math.hypot(moveX, moveY) || 1;
    moveX /= len;
    moveY /= len;
    player.x += moveX * player.speed * speedMultiplier * dt;
    player.y += moveY * player.speed * dt;
  }

  player.x = clamp(player.x, player.radius, WORLD.width - player.radius);
  player.y = clamp(player.y, player.radius, WORLD.height - player.radius);

  const dx = mouse.x - canvas.width / 2;
  const dy = mouse.y - canvas.height / 2;
  player.facing = Math.atan2(dy, dx);
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    enemy.attackTimer -= dt;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 1) {
      const dirX = dx / dist;
      const dirY = dy / dist;
      if (dist > 26) {
        enemy.x += dirX * enemy.speed * enemySpeedMultiplier * dt;
        enemy.y += dirY * enemy.speed * enemySpeedMultiplier * dt;
      }
    }

    if (dist < 28 && enemy.attackTimer <= 0) {
      enemy.attackTimer = enemy.attackCooldown;
      if (player.invulnTimer <= 0) {
        if (invincibleToggle.checked) {
          player.health = player.maxHealth;
          player.invulnTimer = 0.05;
          for (let i = 0; i < 10; i++) {
            particles.push({
              x: player.x,
              y: player.y,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120,
              life: 0.5,
              color: '#7af0a4',
            });
          }
        } else {
          const damage = 12;
          const armorAbsorb = Math.min(player.armor, damage * 0.7);
          player.armor = Math.max(0, player.armor - armorAbsorb);
          const remainingDamage = Math.max(0, damage - armorAbsorb);
          player.health -= remainingDamage;

          player.invulnTimer = 0.7;
          player.hitFlash = 0.25;
          for (let i = 0; i < 10; i++) {
            particles.push({
              x: player.x,
              y: player.y,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120,
              life: 0.5,
              color: '#ff6b6b',
            });
          }
        }
      }
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].health <= 0) {
      enemies.splice(i, 1);
    }
  }
}

function updateMedkits(dt) {
  medkitSpawnTimer -= dt;
  if (medkitSpawnTimer <= 0) {
    spawnMedkit();
    medkitSpawnTimer = 2.5 + Math.random() * 2.5;
  }

  for (let i = medkits.length - 1; i >= 0; i--) {
    const medkit = medkits[i];
    medkit.bob += dt * 4;

    const dx = player.x - medkit.x;
    const dy = player.y - medkit.y;
    const dist = Math.hypot(dx, dy);

    if (dist < player.radius + medkit.radius + 6) {
      player.health = player.maxHealth;
      for (let j = 0; j < 18; j++) {
        particles.push({
          x: medkit.x,
          y: medkit.y,
          vx: (Math.random() - 0.5) * 140,
          vy: (Math.random() - 0.5) * 140,
          life: 0.9,
          color: '#9ef7b2',
        });
      }
      medkits.splice(i, 1);
    }
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function update(dt) {
  if (!running) return;

  player.attackTimer = Math.max(0, player.attackTimer - dt);
  player.invulnTimer = Math.max(0, player.invulnTimer - dt);
  player.hitFlash = Math.max(0, player.hitFlash - dt);
  screenShake = Math.max(0, screenShake - dt * 3.5);

  handleInput(dt);
  updateEnemies(dt);
  updateMedkits(dt);
  updateParticles(dt);
  updateHud();

  if (invincibleToggle.checked) {
    player.health = player.maxHealth;
    player.armor = player.armorMax;
  }

  if (player.health <= 0) {
    endGame();
  }
}

function renderBackground() {
  ctx.fillStyle = '#1d2a33';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cameraX = clamp(player.x - canvas.width / 2, 0, WORLD.width - canvas.width);
  const cameraY = clamp(player.y - canvas.height / 2, 0, WORLD.height - canvas.height);

  for (let x = 0; x < WORLD.width; x += 80) {
    for (let y = 0; y < WORLD.height; y += 80) {
      const sx = x - cameraX;
      const sy = y - cameraY;
      ctx.fillStyle = (x + y) % 160 === 0 ? '#253946' : '#1f313c';
      ctx.fillRect(sx, sy, 80, 80);
    }
  }

  for (let i = 0; i < 18; i++) {
    const rockX = ((i * 97) % WORLD.width) + 70;
    const rockY = ((i * 137) % WORLD.height) + 90;
    const drawX = rockX - cameraX;
    const drawY = rockY - cameraY;
    ctx.fillStyle = '#35515d';
    ctx.beginPath();
    ctx.arc(drawX, drawY, 18 + (i % 3) * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderPlayer() {
  const cameraX = clamp(player.x - canvas.width / 2, 0, WORLD.width - canvas.width);
  const cameraY = clamp(player.y - canvas.height / 2, 0, WORLD.height - canvas.height);
  const px = player.x - cameraX;
  const py = player.y - cameraY;

  const alpha = player.invulnTimer > 0 ? 0.5 + Math.sin(Date.now() / 60) * 0.3 : 1;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(player.facing);

  ctx.fillStyle = '#6c7a89';
  ctx.beginPath();
  ctx.arc(0, 0, player.radius + 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = player.hitFlash > 0 ? '#ffb3b3' : '#7af0a4';
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#dfe8ee';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(72, 0);
  ctx.stroke();

  ctx.restore();

  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#7af0a4';
  ctx.beginPath();
  ctx.arc(px, py, player.radius + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function renderEnemies() {
  const cameraX = clamp(player.x - canvas.width / 2, 0, WORLD.width - canvas.width);
  const cameraY = clamp(player.y - canvas.height / 2, 0, WORLD.height - canvas.height);

  for (const enemy of enemies) {
    const ex = enemy.x - cameraX;
    const ey = enemy.y - cameraY;
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(ex, ey, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    if (enemy.isBoss) {
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ex, ey, enemy.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    const healthWidth = enemy.isBoss ? 36 : 32;
    const maxHealth = enemy.maxHealth || 30;
    ctx.fillStyle = '#fff';
    ctx.fillRect(ex - healthWidth / 2, ey - 30, healthWidth, 5);
    ctx.fillStyle = enemy.isBoss ? '#ffd166' : '#ff6b6b';
    ctx.fillRect(ex - healthWidth / 2, ey - 30, healthWidth * (enemy.health / maxHealth), 5);
  }
}

function renderMedkits() {
  const cameraX = clamp(player.x - canvas.width / 2, 0, WORLD.width - canvas.width);
  const cameraY = clamp(player.y - canvas.height / 2, 0, WORLD.height - canvas.height);

  for (const medkit of medkits) {
    const x = medkit.x - cameraX;
    const y = medkit.y - cameraY + Math.sin(medkit.bob) * 3;
    const size = medkit.radius;

    ctx.fillStyle = '#7af0a4';
    ctx.fillRect(x - size, y, size * 2, 4);
    ctx.fillRect(x, y - size, 4, size * 2);

    ctx.strokeStyle = '#dfffe9';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - size, y - size, size * 2, size * 2);
  }
}

function renderParticles() {
  for (const p of particles) {
    const cameraX = clamp(player.x - canvas.width / 2, 0, WORLD.width - canvas.width);
    const cameraY = clamp(player.y - canvas.height / 2, 0, WORLD.height - canvas.height);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = clamp(p.life * 2, 0, 1);
    ctx.fillRect(p.x - cameraX, p.y - cameraY, 4, 4);
    ctx.globalAlpha = 1;
  }
}

function renderSwordArc() {
  if (player.attackTimer <= 0) return;

  const cameraX = clamp(player.x - canvas.width / 2, 0, WORLD.width - canvas.width);
  const cameraY = clamp(player.y - canvas.height / 2, 0, WORLD.height - canvas.height);
  const px = player.x - cameraX;
  const py = player.y - cameraY;
  const dirX = Math.cos(player.facing);
  const dirY = Math.sin(player.facing);
  const reach = 180;
  const swingProgress = 1 - player.attackTimer / player.attackCooldown;

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(player.facing);
  ctx.strokeStyle = `rgba(244, 211, 94, ${0.8 + swingProgress * 0.2})`;
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(0, 0, 62 + swingProgress * 28, -1.4 + swingProgress * 1.8, 1.4 + swingProgress * 1.8);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, 52 + swingProgress * 26, -1.2 + swingProgress * 1.6, 1.2 + swingProgress * 1.6);
  ctx.stroke();
  ctx.restore();
}

function draw() {
  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake * 25, (Math.random() - 0.5) * screenShake * 25);
  }

  renderBackground();
  renderSwordArc();
  renderParticles();
  renderMedkits();
  renderEnemies();
  renderPlayer();
  renderCombo();
  ctx.restore();
}

function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000 || 0.016, 0.033);
  lastTime = ts;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;
  if (key === ' ' || key === 'spacebar') {
    event.preventDefault();
    attack();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  mouse.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
});

canvas.addEventListener('mousedown', () => {
  mouse.down = true;
  attack();
});

canvas.addEventListener('mouseup', () => {
  mouse.down = false;
});

invincibleToggle.addEventListener('change', () => {
  if (invincibleToggle.checked) {
    player.health = player.maxHealth;
    player.armor = player.armorMax;
  }
});

damageSlider.addEventListener('input', (e) => {
  damageMultiplier = parseFloat(e.target.value);
  damageLabel.textContent = damageMultiplier.toFixed(1) + 'x';
});

speedSlider.addEventListener('input', (e) => {
  speedMultiplier = parseFloat(e.target.value);
  speedLabel.textContent = speedMultiplier.toFixed(1) + 'x';
});

enemySpeedSlider.addEventListener('input', (e) => {
  enemySpeedMultiplier = parseFloat(e.target.value);
  enemySpeedLabel.textContent = enemySpeedMultiplier.toFixed(1) + 'x';
});

function updateWaveDisplay() {
  waveDisplay.textContent = 'Wave: ' + wave;
}

startButton.addEventListener('click', () => {
  overlay.querySelector('h1').textContent = '2D Sword Arena';
  overlay.querySelector('p:nth-of-type(1)').textContent = 'Move with WASD';
  overlay.querySelector('p:nth-of-type(2)').textContent = 'Attack with mouse click or Space';
  overlay.querySelector('p:nth-of-type(3)').textContent = 'Survive as long as you can';
  startButton.textContent = 'Start Game';
  startGame();
});

resetGame();
requestAnimationFrame(loop);
