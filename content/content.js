chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkPage') {
    const adapter = determineAdapter();
    sendResponse({ 
      isSupported: !!adapter, 
      adapterName: adapter ? adapter.name : null 
    });
    return true;
  }
  
  if (request.action === 'fillForm') {
    const adapter = determineAdapter();
    if (!adapter) {
      sendResponse({ success: false, error: "Not a supported booking page." });
      return true;
    }
    
    if (typeof AutofillEngine !== 'undefined') {
      // Support array of profiles
      const profilesToFill = request.profiles || (request.profile ? [request.profile] : []);
      const stats = AutofillEngine.fill(profilesToFill, adapter);
      sendResponse({ success: true, stats: stats });
    } else {
      sendResponse({ success: false, error: "Autofill engine not loaded." });
    }
    return true; 
  }
});

function determineAdapter() {
  const url = window.location.href;
  if (url.includes('tirupatibalaji.ap.gov.in') || url.includes('booking.html')) {
    if (typeof TTDAdapter !== 'undefined') {
      return TTDAdapter;
    }
  }
  return null;
}
