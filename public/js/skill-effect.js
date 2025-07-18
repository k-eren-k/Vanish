document.addEventListener("DOMContentLoaded", function() {
    const skillBars = document.querySelectorAll('.progress-bar-fill');

    const observerOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetWidth = bar.getAttribute('data-width');
                
                setTimeout(() => {
                    bar.style.width = targetWidth;
                }, 200);

                observer.unobserve(bar); 
            }
        });
    }, observerOptions);

    skillBars.forEach(bar => {
        observer.observe(bar);
    });
});