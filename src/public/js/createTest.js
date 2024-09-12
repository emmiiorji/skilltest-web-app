document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('createGroup').addEventListener('click', async () => {
    const response = await fetch('/admin/createGroupAjax', { method: 'POST' });
    const data = await response.json();
    if (data.success) {
      const groupSelect = document.getElementById('group_id');
      const option = new Option(`${data.group.id} | ${data.group.name}`, data.group.id);
      groupSelect.add(option);
      groupSelect.value = data.group.id;
    } else {
      alert(`Error creating group: ${data.error}`);
    }
  });

  document.getElementById('instantCreateProfile').addEventListener('click', async () => {
    const response = await fetch('/admin/createProfileAjax', { method: 'POST' });
    const data = await response.json();
    if (data.success) {
      const profileSelect = document.getElementById('profile_id');
      const option = new Option(`${data.profile.id} | ${data.profile.name}`, data.profile.id);
      profileSelect.add(option);
      profileSelect.value = data.profile.id;
    }
  });

  document.getElementById('createTestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('/admin/createTest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    const data = await response.json();
    if (data.success) {
      alert('Test created successfully!');
      showTestUrl(data.testUrl);
    } else {
      alert(`Error creating test: ${data.error}`);
    }
  });

  document.getElementById('createTemplate').addEventListener('click', async () => {
    const response = await fetch('/admin/createTemplateAjax', { method: 'POST' });
    const data = await response.json();
    if (data.success) {
      const templateSelect = document.getElementById('template_id');
      const option = new Option(`${data.template.id} | ${data.template.template}`, data.template.id);
      templateSelect.add(option);
      templateSelect.value = data.template.id;
    } else {
      alert(`Error creating template: ${data.error}`);
    }
  });
});

function showTestUrl(url) {
  const container = document.createElement('div');
  container.className = 'mt-6 p-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-lg';

  const successMessage = document.createElement('h3');
  successMessage.textContent = '🎉 Test Created Successfully!';
  successMessage.className = 'text-2xl font-bold text-white mb-4 animate-pulse';

  const urlContainer = document.createElement('div');
  urlContainer.className = 'bg-white p-4 rounded-md flex items-center';
  
  const urlText = document.createElement('span');
  urlText.textContent = url;
  urlText.className = 'mr-2 flex-grow font-mono text-sm';
  
  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy';
  copyButton.className = 'px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105';
  copyButton.onclick = () => {
    navigator.clipboard.writeText(url).then(() => {
      copyButton.textContent = 'Copied!';
      setTimeout(() => copyButton.textContent = 'Copy', 2000);
    });
  };
  
  urlContainer.appendChild(urlText);
  urlContainer.appendChild(copyButton);

  container.appendChild(successMessage);
  container.appendChild(urlContainer);
  
  const form = document.getElementById('createTestForm');
  form.parentNode.insertBefore(container, form.nextSibling);
}