document.addEventListener('DOMContentLoaded', function() {
  const openModalBtn = document.getElementById('openModalBtn');
  const modal = document.getElementById('createGroupModal');

  openModalBtn.addEventListener('click', function() {
    modal.style.display = 'block';
  });

  window.addEventListener('click', function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  });
});