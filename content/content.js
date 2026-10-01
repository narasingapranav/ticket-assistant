chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkPage') {
    const adapter = determineAdapter();
    sendResponse({ 
      isSupported: !!adapter, 
      adapterName: adapter ? adapter.name : null,
      detectedAt: Date.now()
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
      const formDetectedAt = Date.now();
      const stats = AutofillEngine.fill(profilesToFill, adapter);
      stats.timing.formDetectedAt = formDetectedAt;
      stats.timing.fillClickedAt = request.fillClickedAt || formDetectedAt;
      stats.timing.fieldsCompletedAt = Date.now();
      sendResponse({ success: true, stats: stats, detectedAt: Date.now() });
    } else {
      sendResponse({ success: false, error: "Autofill engine not loaded." });
    }
    return true; 
  }
});

function determineAdapter() {
  const hostname = window.location.hostname.toLowerCase();
  const isLocalTestPage = window.location.protocol === 'file:' &&
    window.location.pathname.toLowerCase().endsWith('/test-page/booking.html');
  const isSupportedHost = hostname === 'tirupatibalaji.ap.gov.in' ||
    hostname.endsWith('.tirupatibalaji.ap.gov.in') ||
    hostname === 'ttdevasthanams.ap.gov.in' ||
    hostname.endsWith('.ttdevasthanams.ap.gov.in') ||
    (window.location.hostname === 'localhost');

  if ((isLocalTestPage || isSupportedHost) &&
      typeof TTDAdapter !== 'undefined' && TTDAdapter.isFormPresent()) {
    return TTDAdapter;
  }

  return null;
}
