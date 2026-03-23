document.addEventListener('DOMContentLoaded', () => {
  const tooltip = document.getElementById('tooltip');
  const hotspots = document.querySelectorAll('.hotspot');

  const scene = document.querySelector('.scene');

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
        }
      }, delay);

      delay += 1200;
    });
  }
});
