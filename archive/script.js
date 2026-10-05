(() => {
  const archive = document.querySelector('.archive');
  const viewer = document.querySelector('.viewer');
  const dialog = viewer.querySelector('.sheet');
  const backdrop = viewer.querySelector('.backdrop');
  const closeButton = viewer.querySelector('.close');
  const visitLink = viewer.querySelector('.visit');
  const mode = document.querySelector('.mode');
  let frame = 0;
  let opener = null;

  const updateProgress = () => {
    frame = 0;
    const rect = archive.getBoundingClientRect();
    const range = Math.max(1, archive.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / range));
    archive.style.setProperty('--progress', String(progress));
  };
  const requestProgress = () => {
    if (!frame) frame = requestAnimationFrame(updateProgress);
  };
  updateProgress();
  window.addEventListener('scroll', requestProgress, { passive: true });
  window.addEventListener('resize', requestProgress);

  mode.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    mode.setAttribute('aria-label', `${dark ? '라이트' : '다크'} 모드로 전환`);
    mode.setAttribute('aria-pressed', String(dark));
    mode.querySelector('span').textContent = dark ? 'Dark' : 'Light';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#050505' : '#ffffff';
  });

  const closeViewer = () => {
    if (!dialog.open) return;
    viewer.classList.remove('open');
    viewer.setAttribute('aria-hidden', 'true');
    dialog.close();
    backdrop.tabIndex = -1;
    document.querySelector('#archive-main').inert = false;
    document.body.style.overflow = '';
    opener?.focus();
  };

  document.querySelectorAll('.work').forEach((work) => {
    work.addEventListener('click', () => {
      opener = work;
      const source = work.querySelector('img');
      const target = dialog.querySelector('.large-image img');
      const title = work.querySelector('.label strong').textContent;
      target.src = source.src;
      target.alt = source.alt;
      dialog.querySelector('.sheet-index').textContent = `${work.querySelector('.label span').textContent} / 06`;
      dialog.querySelector('.sheet-foot h2').textContent = title;
      dialog.querySelector('.sheet-foot p').textContent = work.dataset.kind;
      visitLink.hidden = !work.dataset.site;
      if (work.dataset.site) {
        visitLink.href = work.dataset.site;
        const external = work.dataset.site.startsWith('https://');
        visitLink.target = external ? '_blank' : '_self';
        visitLink.rel = external ? 'noopener noreferrer' : '';
        visitLink.setAttribute('aria-label', `${title} 사이트 열기${external ? ', 새 탭' : ''}`);
      }
      dialog.setAttribute('aria-label', `${title} 작품 상세`);
      viewer.classList.add('open');
      viewer.setAttribute('aria-hidden', 'false');
      backdrop.tabIndex = 0;
      dialog.showModal();
      document.querySelector('#archive-main').inert = true;
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    });
  });

  backdrop.addEventListener('click', closeViewer);
  closeButton.addEventListener('click', closeViewer);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeViewer();
  });
})();
