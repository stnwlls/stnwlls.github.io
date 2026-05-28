document.querySelectorAll('video').forEach((video) => {
  const existingControlsList = video.getAttribute('controlslist') || video.getAttribute('controlsList') || '';
  video.setAttribute('controlsList', `${existingControlsList} nofullscreen`.trim());

  const container = video.closest('.hero-media') || video.parentElement;
  if (!container) return;

  container.classList.add('video-expand-container');

  let isOpeningDialog = false;

  function openExpandedVideo() {
    if (isOpeningDialog) return;
    isOpeningDialog = true;

    const dialog = document.createElement('dialog');
    dialog.className = 'video-dialog';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'video-dialog-close';
    closeButton.textContent = 'Close';

    const expandedVideo = video.cloneNode(true);
    expandedVideo.controls = true;
    expandedVideo.currentTime = video.currentTime;

    video.pause();

    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      expandedVideo.pause();
      video.currentTime = expandedVideo.currentTime;
      dialog.remove();
      isOpeningDialog = false;
    });

    dialog.append(closeButton, expandedVideo);
    document.body.appendChild(dialog);

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }

    expandedVideo.play().catch(() => {});
  }

  video.addEventListener('play', openExpandedVideo);
});
