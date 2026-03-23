document.addEventListener('DOMContentLoaded', () => {
  const tooltip = document.getElementById('tooltip');
  const hotspots = document.querySelectorAll('.hotspot');

  const scene = document.querySelector('.scene');
  const bgMusic = document.getElementById('bgMusic');
  const BG_NORMAL = 0.2;
  const BG_DUCKED = 0.05;
  const FADE_MS = 900;
  /** За сколько мс до конца эффекта начинать поднимать фон (перекрытие с концом трека) */
  const OVERLAP_MS = FADE_MS;
  bgMusic.volume = BG_NORMAL;

  let bgVolumeRaf = null;

  function rampBgVolume(target, durationMs = FADE_MS) {
    if (bgVolumeRaf) cancelAnimationFrame(bgVolumeRaf);
    const startVol = bgMusic.volume;
    const t0 = performance.now();
    function step(now) {
      const t = Math.min(1, (now - t0) / durationMs);
      const eased = t * t * (3 - 2 * t);
      bgMusic.volume = startVol + (target - startVol) * eased;
      if (t < 1) {
        bgVolumeRaf = requestAnimationFrame(step);
      } else {
        bgMusic.volume = target;
        bgVolumeRaf = null;
      }
    }
    bgVolumeRaf = requestAnimationFrame(step);
  }

  const lootSound = new Audio('loot-sound.mp3');
  lootSound.volume = 0.5;

  function playLootSoundWithOverlap() {
    let restoreStarted = false;

    function onTimeUpdate() {
      if (restoreStarted || !lootSound.duration || !isFinite(lootSound.duration)) return;
      const remainingMs = (lootSound.duration - lootSound.currentTime) * 1000;
      if (remainingMs <= OVERLAP_MS) {
        restoreStarted = true;
        rampBgVolume(BG_NORMAL);
      }
    }

    function onEnded() {
      lootSound.removeEventListener('timeupdate', onTimeUpdate);
      lootSound.removeEventListener('ended', onEnded);
      if (!restoreStarted) {
        rampBgVolume(BG_NORMAL);
      } else {
        bgMusic.volume = BG_NORMAL;
      }
    }

    lootSound.addEventListener('timeupdate', onTimeUpdate);
    lootSound.addEventListener('ended', onEnded);
    lootSound.currentTime = 0;
    lootSound.play();
  }

  const welcomeScreen = document.getElementById('welcomeScreen');
  const welcomeBtn = document.getElementById('welcomeBtn');

  welcomeBtn.addEventListener('click', () => {
    if (bgMusic.paused) bgMusic.play();
    scene.classList.remove('dimmed');
    document.body.classList.add('game-started');
    welcomeScreen.classList.add('hidden');
  }, { once: true });

  hotspots.forEach(zone => {
    zone.addEventListener('mouseenter', () => {
      tooltip.textContent = zone.dataset.label;
      tooltip.classList.add('visible');
    });

    zone.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });

    zone.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.clientX + 16 + 'px';
      tooltip.style.top = e.clientY + 16 + 'px';
    });

    zone.addEventListener('click', () => {
      scene.classList.add('dimmed');
      document.getElementById('overlay').classList.add('visible');
      tooltip.classList.remove('visible');
      zone.remove();
      revealLoot();
    });
  });

  const itemCard = document.getElementById('itemCard');

  function showItemCard(cell) {
    document.getElementById('cardTitle').textContent = cell.dataset.title;
    document.getElementById('cardDesc').textContent = cell.dataset.desc;
    document.getElementById('cardFrom').textContent = cell.dataset.from;
    document.getElementById('cardQty').textContent = cell.dataset.qty;
    document.getElementById('cardWeight').innerHTML = '<img src="weight.svg" class="weight-icon"> ' + cell.dataset.weight;
    document.getElementById('cardPrice').textContent = cell.dataset.price;
    itemCard.classList.add('visible');
  }

  document.addEventListener('click', (e) => {
    if (itemCard.classList.contains('visible') && !itemCard.contains(e.target) && !e.target.closest('.loot-cell')) {
      itemCard.classList.remove('visible');
    }
  });

  function revealLoot() {
    const cells = document.querySelectorAll('.loot-cell[data-loot]');
    let delay = 1200;

    cells.forEach(cell => {
      const src = cell.dataset.loot;
      if (!src) return;

      setTimeout(() => {
        const img = document.createElement('img');
        img.src = src;
        img.classList.add('loot-reveal');
        cell.appendChild(img);
        cell.classList.add('shimmer');
        requestAnimationFrame(() => img.classList.add('shown'));

        if (cell.dataset.title) {
          cell.classList.add('revealed');
          cell.addEventListener('click', () => showItemCard(cell));

          rampBgVolume(BG_DUCKED);
          playLootSoundWithOverlap();
        }
      }, delay);

      delay += 1200;
    });
  }
});
