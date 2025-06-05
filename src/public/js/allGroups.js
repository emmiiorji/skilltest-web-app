document.addEventListener('DOMContentLoaded', function() {
  const openModalBtn = document.getElementById('openModalBtn');
  const modal = document.getElementById('createGroupModal');

  if (openModalBtn && modal) {
    // Store original parent for cleanup
    const originalParent = modal.parentNode;

    openModalBtn.addEventListener('click', function() {
      // Move modal to body to ensure it's on top
      document.body.appendChild(modal);
      modal.classList.add('active');
      modal.style.display = 'flex';
    });

    function closeModal() {
      modal.classList.remove('active');
      modal.style.display = 'none';
      // Move modal back to original location
      originalParent.appendChild(modal);
    }

    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    // Handle close buttons
    const closeButtons = modal.querySelectorAll('.modal-close, [onclick*="style.display=\'none\'"]');
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        closeModal();
      });
    });
  }
});