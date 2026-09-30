# TicketAssist

TicketAssist is a Chrome extension designed to save traveler details and quickly fill them into supported TTD temple booking forms. It keeps profile data in browser storage and fills only the fields it recognizes on the page without submitting or booking anything.

## What it does

- Saves multiple pilgrim profiles locally in the browser
- Lets you select one or more saved profiles from the extension popup
- Detects supported temple booking pages
- Fills common fields such as name, gender, age, ID type, ID number, mobile, email, city, state, country, and pincode
- Works with the sample local test page and the supported official booking domains

## Safety and scope

This extension is intentionally limited to form filling. It does not complete a booking or payment flow. It only reads the current page and writes values into recognized form inputs.

## Supported pages

The extension is configured to work with:

- local test pages such as `file://` and `http://localhost/*`
- Tirupati Balaji booking pages
- TT Devasthanams booking pages

## Project structure

- `manifest.json` – Chrome extension manifest
- `content/` – page detection and autofill logic
- `adapters/` – site-specific field mappings
- `popup/` – extension popup UI
- `storage/` – local profile storage helpers
- `test-page/` – sample page for testing locally
- `icons/` – extension icons

## Installation

1. Open `chrome://extensions` in Google Chrome.
2. Turn on Developer mode.
3. Click Load unpacked.
4. Select the folder containing `manifest.json`.
5. Open the extension details and enable Allow access to file URLs if you are testing on local files.

## Local testing

1. Open the sample page at `test-page/booking.html`.
2. Press F12 to open DevTools.
3. Check the Console for a message similar to:
   `[TicketAssist] content script loaded on: file:///...`
4. Click the TicketAssist extension icon in the toolbar.
5. Create or select a profile and click Fill Form.
6. Confirm the form fields are populated on the page.

## Typical workflow

1. Save a traveler profile in the extension popup.
2. Open a supported booking form.
3. Select the saved profile(s) you want to use.
4. Click Fill Form.
5. Review the filled values before submitting anything manually.

## Development notes

This project is a browser extension prototype and is best suited for local testing and extension development. It uses Chrome storage for persistence and site-specific selectors to map form fields to profile data.

## Future improvements

Potential enhancements include:

- better multi-profile validation and duplicate detection
- improved selectors for different booking page layouts
- support for more temple portals and form variants
- UI polish and profile import/export
- live form-status messaging and error handling

## License

This project is currently unlicensed unless otherwise specified in the repository.
