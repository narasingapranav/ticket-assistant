document.addEventListener('DOMContentLoaded', async () => {
  const profileSelect = document.getElementById('profileSelect');
  const fillFormBtn = document.getElementById('fillFormBtn');
  const manageBtn = document.getElementById('manageBtn');
  const profileForm = document.getElementById('profileForm');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const cancelProfileBtn = document.getElementById('cancelProfileBtn');
  const deleteProfileBtn = document.getElementById('deleteProfileBtn');

  const statusText = document.getElementById('statusText');
  const fieldsFound = document.getElementById('fieldsFound');
  const fieldsFilled = document.getElementById('fieldsFilled');
  const fieldsMissing = document.getElementById('fieldsMissing');
  const fillTime = document.getElementById('fillTime');

  let currentProfiles = [];

  async function loadProfiles() {
    currentProfiles = await ProfileStorage.getProfiles();
    profileSelect.innerHTML = '<option value="">-- Select Profile --</option>';
    currentProfiles.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name || 'Unnamed Profile';
      profileSelect.appendChild(opt);
    });
    if (currentProfiles.length > 0) {
      profileSelect.value = currentProfiles[0].id;
    }
  }

  await loadProfiles();

  // Manage UI
  manageBtn.addEventListener('click', () => {
    profileForm.classList.remove('hidden');
    const selectedId = profileSelect.value;
    if (selectedId) {
      const p = currentProfiles.find(x => x.id === selectedId);
      if (p) {
        document.getElementById('pid').value = p.id;
        document.getElementById('pname').value = p.name || '';
        document.getElementById('pgender').value = p.gender || '';
        document.getElementById('page').value = p.age || '';
        document.getElementById('pidType').value = p.idType || '';
        document.getElementById('pidNumber').value = p.idNumber || '';
        document.getElementById('pmobile').value = p.mobile || '';
        document.getElementById('pcity').value = p.city || '';
        document.getElementById('pstate').value = p.state || '';
        document.getElementById('ppincode').value = p.pincode || '';
        deleteProfileBtn.style.display = 'block';
        return;
      }
    }
    // Clear for new
    document.getElementById('pid').value = '';
    document.getElementById('pname').value = '';
    document.getElementById('pgender').value = '';
    document.getElementById('page').value = '';
    document.getElementById('pidType').value = '';
    document.getElementById('pidNumber').value = '';
    document.getElementById('pmobile').value = '';
    document.getElementById('pcity').value = '';
    document.getElementById('pstate').value = '';
    document.getElementById('ppincode').value = '';
    deleteProfileBtn.style.display = 'none';
  });

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
      city: document.getElementById('pcity').value,
      state: document.getElementById('pstate').value,
      pincode: document.getElementById('ppincode').value
    };
    await ProfileStorage.saveProfile(p);
    await loadProfiles();
    profileSelect.value = p.id; 
    profileForm.classList.add('hidden');
  });

  deleteProfileBtn.addEventListener('click', async () => {
    const id = document.getElementById('pid').value;
    if (id) {
      await ProfileStorage.deleteProfile(id);
      await loadProfiles();
    }
    profileForm.classList.add('hidden');
  });

  // Communication with content script
  fillFormBtn.addEventListener('click', async () => {
    const selectedId = profileSelect.value;
    if (!selectedId) {
      statusText.textContent = "Please select a profile first.";
      return;
    }
    const profile = currentProfiles.find(x => x.id === selectedId);
    if (!profile) return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;
      
      statusText.textContent = "Filling form...";
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'fillForm',
        profile: profile
      });
      
      if (response && response.success) {
        statusText.textContent = "Form filled!";
        fieldsFound.textContent = response.stats.found;
        fieldsFilled.textContent = response.stats.filled;
        fieldsMissing.textContent = response.stats.missingCount + (response.stats.missingCount > 0 ? ` (${response.stats.missingFields.join(', ')})` : '');
        fillTime.textContent = response.stats.duration.toFixed(2) + " ms";
      } else {
        statusText.textContent = response?.error || "Error or no form detected.";
      }
    } catch (e) {
      statusText.textContent = "Could not communicate with page.";
      console.error(e);
    }
  });

  // Check initial status on open
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const res = await chrome.tabs.sendMessage(tab.id, { action: 'checkPage' });
      if (res && res.isSupported) {
        statusText.textContent = `${res.adapterName} booking page detected`;
      } else {
        statusText.textContent = "No supported booking form detected";
      }
    }
  } catch (e) {
    statusText.textContent = "No supported booking form detected (or cannot read page).";
  }
});
