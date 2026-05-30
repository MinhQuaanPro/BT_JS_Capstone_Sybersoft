// js/theme.js
(function() {
    const toggleBtn = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;

    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlEl.setAttribute('data-bs-theme', savedTheme);

    // Click event
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isDark = toggleBtn.classList.toggle('active');
            // Nếu active -> dark, nếu không -> light
            const newTheme = isDark ? 'dark' : 'light';
            
            htmlEl.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
})();