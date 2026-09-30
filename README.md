# TicketAssist (Step 1)

1. Open chrome://extensions and enable Developer mode.
2. Click "Load unpacked" and select this folder (the one containing manifest.json).
3. Open Details on TicketAssist and enable "Allow access to file URLs".
4. Open test-page/booking.html, press F12, and check the Console for:
   [TicketAssist] content script loaded on: file:///...
5. Click the toolbar icon; the popup should say "Extension loaded".
