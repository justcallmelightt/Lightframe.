(() => {
  const archive = document.querySelector('.archive');
  const viewer = document.querySelector('.viewer');
  const dialog = viewer.querySelector('.sheet');
  const backdrop = viewer.querySelector('.backdrop');
  const closeButton = viewer.querySelector('.close');
  const visitLink = viewer.querySelector('.visit');
  const repoLink = viewer.querySelector('.repo-link');
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

  const serviceToggles = [...document.querySelectorAll('.service-toggle')];
  serviceToggles.forEach((toggle) => {
    const detail = document.getElementById(toggle.getAttribute('aria-controls'));
    detail.inert = true;
    toggle.addEventListener('click', () => {
      const expanding = toggle.getAttribute('aria-expanded') !== 'true';
      serviceToggles.forEach((other) => {
        const open = other === toggle && expanding;
        other.setAttribute('aria-expanded', String(open));
        document.getElementById(other.getAttribute('aria-controls')).inert = !open;
      });
    });
  });

  const setProjectLink = (link, url, title, destination) => {
    link.hidden = !url;
    if (!url) {
      link.removeAttribute('href');
      return;
    }
    link.href = url;
    const external = new URL(url, location.href).origin !== location.origin;
    link.target = external ? '_blank' : '_self';
    link.rel = external ? 'noopener noreferrer' : '';
    link.setAttribute('aria-label', `${title} ${destination} 열기${external ? ', 새 탭' : ''}`);
  };

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
      setProjectLink(visitLink, work.dataset.site, title, '서비스');
      setProjectLink(repoLink, work.dataset.repo, title, 'GitHub');
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
