document.addEventListener('DOMContentLoaded', function() {
    const video = document.querySelector('.intro-video');
    const content = document.querySelector('.content');
    const videoContainer = document.querySelector('.video-container');

    video.addEventListener('ended', () => {
        videoContainer.classList.add('fade-out');
        setTimeout(() => {
            videoContainer.style.display = 'none';
            content.classList.remove('hidden');
            content.style.display = 'block';
            document.body.style.overflow = 'auto';
        }, 1000);
    });
});
