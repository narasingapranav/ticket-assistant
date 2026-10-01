# TicketAssist

TicketAssist is a Chrome extension for saving traveler details and filling them into supported temple booking forms. It keeps profile data in browser storage and only fills recognized fields on supported pages.

## Features

- Save multiple traveler profiles locally in Chrome storage
- Select one or more saved profiles from the extension popup
- Detect supported booking pages automatically
- Fill common pilgrim fields such as name, gender, age, ID type, ID number, mobile, email, city, state, country, and pincode
- Positional field guessing was removed.
- Fields that cannot be identified are reported as missing instead of guessed.
- TTD selectors must be re-checked after any TTD website change.

TTD selectors are unverified against the live site and must be checked against the real booking form before live use.

## Safety and scope

This extension is purposely limited to form filling. It does not submit bookings, complete payments, or perform any booking workflow on its own. It only reads the current page and writes values into target form inputs when they are detected.

## Supported pages

The extension is configured to work with:

- Tirupati Balaji booking pages
- TT Devasthanams booking pages

## Project structure

- `manifest.json` – Chrome extension manifest
- `content/` – page detection and autofill logic
- `adapters/` – site-specific field mappings
- `popup/` – popup UI and profile management
- `storage/` – browser-local profile storage
- `icons/` – extension icons
- `LICENSE` – MIT license file

## Installation

1. Open `chrome://extensions` in Google Chrome.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the project folder containing `manifest.json`.
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
