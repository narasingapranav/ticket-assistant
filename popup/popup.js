document.addEventListener('DOMContentLoaded', async () => {
  const fillFormBtn = document.getElementById('fillFormBtn');
  const newProfileBtn = document.getElementById('newProfileBtn');
  const profileForm = document.getElementById('profileForm');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const cancelProfileBtn = document.getElementById('cancelProfileBtn');
  const deleteProfileBtn = document.getElementById('deleteProfileBtn');

  const statusText = document.getElementById('statusText');
  const fieldsFound = document.getElementById('fieldsFound');
  const fieldsFilled = document.getElementById('fieldsFilled');
  const fieldsMissing = document.getElementById('fieldsMissing');
  const fillTime = document.getElementById('fillTime');
  const missingFieldsList = document.getElementById('missingFieldsList');
  const scanTime = document.getElementById('scanTime');
  const domWritesTime = document.getElementById('domWritesTime');
  const completedTime = document.getElementById('completedTime');
  const detectedTime = document.getElementById('detectedTime');
  const clickedTime = document.getElementById('clickedTime');

  let currentProfiles = [];

  async function loadProfiles() {
    currentProfiles = await ProfileStorage.getProfiles();
    const selection = await chrome.storage.local.get('selectedProfileIds');
    const selectedProfileIds = selection.selectedProfileIds || [];
    const profileList = document.getElementById('profileList');
    profileList.innerHTML = '';
    
    if (currentProfiles.length === 0) {
      profileList.innerHTML = '<div style="padding: 12px; color: var(--text-muted); font-size: 13px; text-align: center;">No profiles found.</div>';
      return;
    }

    currentProfiles.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'profile-item';
      
      const lbl = document.createElement('label');
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.value = p.id;
      chk.className = 'profile-checkbox';
      chk.checked = selectedProfileIds.length > 0
        ? selectedProfileIds.includes(p.id)
        : i === 0;
      chk.addEventListener('change', async () => {
        const selected = Array.from(document.querySelectorAll('.profile-checkbox:checked'))
          .map(checkbox => checkbox.value);
        await chrome.storage.local.set({ selectedProfileIds: selected });
      });
      
      lbl.appendChild(chk);
      lbl.appendChild(document.createTextNode(p.name || 'Unnamed'));
      
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.title = 'Edit';
      // Inline SVG for edit icon
      editBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
      editBtn.onclick = () => openEditForm(p);

      item.appendChild(lbl);
      item.appendChild(editBtn);
      profileList.appendChild(item);
    });
  }

  await loadProfiles();

  function openEditForm(p) {
    profileForm.classList.remove('hidden');
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = p ? 'Edit Profile' : 'New Profile';
    
    if (p) {
      document.getElementById('pid').value = p.id;
      document.getElementById('pname').value = p.name || '';
      document.getElementById('pgender').value = p.gender || '';
      document.getElementById('page').value = p.age || '';
      document.getElementById('pidType').value = p.idType || '';
      document.getElementById('pidNumber').value = p.idNumber || '';
      document.getElementById('pmobile').value = p.mobile || '';
      document.getElementById('pemail').value = p.email || '';
      document.getElementById('pcity').value = p.city || '';
      document.getElementById('pstate').value = p.state || '';
      document.getElementById('pcountry').value = p.country || '';
      document.getElementById('ppincode').value = p.pincode || '';
      deleteProfileBtn.style.display = 'block';
    } else {
      document.getElementById('pid').value = '';
      document.getElementById('pname').value = '';
      document.getElementById('pgender').value = '';
      document.getElementById('page').value = '';
      document.getElementById('pidType').value = '';
      document.getElementById('pidNumber').value = '';
      document.getElementById('pmobile').value = '';
      document.getElementById('pemail').value = '';
      document.getElementById('pcity').value = '';
      document.getElementById('pstate').value = '';
      document.getElementById('pcountry').value = '';
      document.getElementById('ppincode').value = '';
      deleteProfileBtn.style.display = 'none';
    }
  }

  newProfileBtn.addEventListener('click', () => openEditForm(null));

  cancelProfileBtn.addEventListener('click', () => {
    profileForm.classList.add('hidden');
  });

  saveProfileBtn.addEventListener('click', async () => {
    const p = {
      id: document.getElementById('pid').value || undefined,
      name: document.getElementById('pname').value,
      gender: document.getElementById('pgender').value,
      age: document.getElementById('page').value,
      idType: document.getElementById('pidType').value,
      idNumber: document.getElementById('pidNumber').value,
      mobile: document.getElementById('pmobile').value,
      email: document.getElementById('pemail').value,
      city: document.getElementById('pcity').value,
      state: document.getElementById('pstate').value,
      country: document.getElementById('pcountry').value,
      pincode: document.getElementById('ppincode').value
    };
    await ProfileStorage.saveProfile(p);
    await loadProfiles();
    profileForm.classList.add('hidden');
  });

  deleteProfileBtn.addEventListener('click', async () => {
    const id = document.getElementById('pid').value;
    if (id && window.confirm('Delete this profile?')) {
      await ProfileStorage.deleteProfile(id);
      await loadProfiles();
    }
    profileForm.classList.add('hidden');
  });

  async function sendPageMessage(tabId, message) {
    try {
      return await chrome.tabs.sendMessage(tabId, message);
    } catch (error) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['adapters/ttd.js', 'content/autofill.js', 'content/content.js']
      });
      return chrome.tabs.sendMessage(tabId, message);
    }
  }

  fillFormBtn.addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('.profile-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(c => c.value);
    
    if (selectedIds.length === 0) {
      statusText.textContent = "Select at least 1 profile";
      return;
    }
    
    const selectedProfiles = selectedIds.map(id => currentProfiles.find(p => p.id === id)).filter(Boolean);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;
      
      statusText.textContent = "Filling form...";
      
      const response = await sendPageMessage(tab.id, {
        action: 'fillForm',
        profiles: selectedProfiles
      });
      
      if (response && response.success) {
        statusText.textContent = "Form filled!";
        fieldsFound.textContent = response.stats.found;
        fieldsFilled.textContent = response.stats.filled;
        fieldsMissing.textContent = response.stats.missingCount;
        fillTime.textContent = response.stats.duration.toFixed(2) + " ms";
        missingFieldsList.textContent = response.stats.missingFields.length
          ? `Issues: ${response.stats.missingFields.join(', ')}`
          : 'Issues: none';
        scanTime.textContent = response.stats.timing.scan.toFixed(2) + ' ms';
        domWritesTime.textContent = response.stats.timing.domWrites.toFixed(2) + ' ms';
        completedTime.textContent = response.stats.timing.fieldsCompletedAt.toFixed(2) + ' ms';
        detectedTime.textContent = response.stats.timing.formDetectedAt === null
          ? '--'
          : response.stats.timing.formDetectedAt.toFixed(2) + ' ms';
        clickedTime.textContent = response.stats.timing.fillReceivedAt.toFixed(2) + ' ms';
      } else {
        statusText.textContent = response?.error || "Error or no form detected.";
      }
    } catch (e) {
      statusText.textContent = e.message || "Cannot communicate with page.";
      console.error(e);
    }
  });

  // Check initial status on open
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const res = await sendPageMessage(tab.id, { action: 'checkPage' });
      if (res && res.isSupported) {
        statusText.textContent = `Page detected: ${res.adapterName}`;
      } else {
        statusText.textContent = "No supported booking form";
      }
    }
  } catch (e) {
    statusText.textContent = "Cannot read page.";
  }
});
