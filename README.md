# TicketAssist

TicketAssist is a Chrome extension for saving traveler details and filling them into supported temple booking forms. It keeps profile data in browser storage and only fills recognized fields on supported pages.

## Features

- Save multiple traveler profiles locally in Chrome storage
- Select one or more saved profiles from the extension popup
- Detect supported booking pages automatically
- Fill common pilgrim fields such as name, gender, age, ID type, ID number, mobile, email, city, state, country, and pincode
- Works with the included local test page and the supported booking domains

## Safety and scope

This extension is purposely limited to form filling. It does not submit bookings, complete payments, or perform any booking workflow on its own. It only reads the current page and writes values into target form inputs when they are detected.

## Supported pages

The extension is configured to work with:

- local file and localhost testing pages
- Tirupati Balaji booking pages
- TT Devasthanams booking pages

## Project structure

- `manifest.json` – Chrome extension manifest
- `content/` – page detection and autofill logic
- `adapters/` – site-specific field mappings
- `popup/` – popup UI and profile management
- `storage/` – browser-local profile storage
- `test-page/` – sample booking page for local testing
- `icons/` – extension icons
- `LICENSE` – MIT license file

## Installation

1. Open `chrome://extensions` in Google Chrome.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the project folder containing `manifest.json`.
5. If testing on local files, open extension details and enable Allow access to file URLs.

## Local testing

1. Open `test-page/booking.html` in the browser.
2. Press F12 to open DevTools.
3. Check the Console for a message similar to:
   `[TicketAssist] content script loaded on: file:///...`
4. Click the TicketAssist extension icon in the toolbar.
5. Create or choose a profile and click Fill Form.
6. Review the values filled into the page before submitting anything manually.

## Typical workflow

1. Save a traveler profile from the popup.
2. Open a supported booking form.
3. Select the desired saved profile(s).
4. Click Fill Form.
5. Verify the information and continue manually.

## Development notes

This repository is a browser extension prototype intended for local testing and extension development. It uses Chrome storage for persistence and context-specific selectors to map common form fields to saved profile data.

## Future improvements

Possible enhancements include:

- better multi-profile validation and duplicate handling
- more resilient selectors for layout variations
- support for additional booking portals
- profile import/export
- cleaner UX and status messaging

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
