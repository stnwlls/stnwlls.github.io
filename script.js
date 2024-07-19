document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('introVideo');
    const content = document.getElementById('content');

    video.addEventListener('ended', () => {
        video.classList.add('fade-out');
        setTimeout(() => {
            video.style.display = 'none';
            content.classList.remove('hidden');
            document.body.style.overflow = 'auto'; // Allow scrolling after video
        }, 1000); // Adjust the timeout to match the fade-out duration
    });
});
