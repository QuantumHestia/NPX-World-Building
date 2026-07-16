// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  // Only run on mobile
  if (window.innerWidth <= 850) {
    // Create mobile menu toggle button
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '☰';
    menuToggle.setAttribute('aria-label', 'Toggle menu');
    document.body.appendChild(menuToggle);
    
    const sidebar = document.querySelector('.sidebar.left');
    
    if (sidebar) {
      // Add close button inside sidebar for mobile
      const closeButton = document.createElement('button');
      closeButton.className = 'menu-close';
      closeButton.innerHTML = '×';
      closeButton.setAttribute('aria-label', 'Close menu');
      sidebar.insertBefore(closeButton, sidebar.firstChild);
      
      menuToggle.addEventListener('click', function() {
        sidebar.classList.add('menu-open');
      });
      
      closeButton.addEventListener('click', function() {
        sidebar.classList.remove('menu-open');
      });
      
      // Close menu when clicking outside on mobile
      document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
          sidebar.classList.remove('menu-open');
        }
      });
    }
  }
});