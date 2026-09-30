// storage/profiles.js
const ProfileStorage = {
  async getProfiles() {
    const data = await chrome.storage.local.get('profiles');
    return data.profiles || [];
  },

  async saveProfile(profile) {
    const profiles = await this.getProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profile.id = Date.now().toString(); // simple unique id
      profiles.push(profile);
    }
    await chrome.storage.local.set({ profiles });
    return profile;
  },

  async deleteProfile(profileId) {
    let profiles = await this.getProfiles();
    profiles = profiles.filter(p => p.id !== profileId);
    await chrome.storage.local.set({ profiles });
  },

  async getDefaultProfile() {
    const profiles = await this.getProfiles();
    return profiles.length > 0 ? profiles[0] : null;
  }
};
