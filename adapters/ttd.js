// Selectors unverified until tested on the live form.
const TTDAdapter = {
  name: "TTD",

  isFormPresent() {
    const hasKnownForm = document.querySelector('form#bookingForm, form[action*="booking" i]');
    if (hasKnownForm) return true;

    const isAngapradakshinamPage = window.location.pathname.toLowerCase().includes('/agp/');
    const hasBookingControls = document.querySelector(
      'input, select, textarea, button'
    );
    return isAngapradakshinamPage && !!hasBookingControls;
  },

  fieldMap: (index) => {
    const pilgrimSections = document.querySelectorAll(
      '.pilgrim-section, [data-pilgrim], [class*="pilgrim" i], [class*="passenger" i]'
    );
    const section = pilgrimSections[index] || (index === 0 ? document : null);
    const contactSection = document.querySelector(
      '.contact-section, [data-contact-section], [class*="contact" i]'
    ) || document;

    const findField = (root, selectors, labels) => {
      if (!root) return null;
      for (const selector of selectors) {
        const element = root.querySelector(selector);
        if (element) return element;
      }
      const label = Array.from(root.querySelectorAll('label')).find((candidate) => {
        const labelText = candidate.textContent.trim().toLowerCase().replace(/\s+/g, ' ');
        return labels.some((text) => labelText === text || labelText.includes(text));
      }
      );
      return label
        ? label.control || label.parentElement?.querySelector('input, select, textarea')
        : null;
    };

    const normalizeLabel = (text) => text
      .replace(/\*/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    const controlSelector = 'input, select, textarea, [role="combobox"], [aria-haspopup="listbox"]';
    const findLabeledField = (labels, occurrence) => {
      const wanted = labels.map(normalizeLabel);
      const fields = [];
      const candidates = Array.from(document.querySelectorAll('*'))
        .filter((candidate) => wanted.includes(normalizeLabel(candidate.textContent || '')));

      for (const candidate of candidates) {
        let container = candidate;
        for (let depth = 0; depth < 6 && container; depth++, container = container.parentElement) {
          const control = container.matches(controlSelector)
            ? container
            : container.querySelector(controlSelector);
          if (control && control.getClientRects().length > 0) {
            if (!fields.includes(control)) fields.push(control);
            break;
          }
        }
      }
      return fields[occurrence] || null;
    };
    const findNamedField = (name, occurrence) => Array.from(document.querySelectorAll(
      `[name="${name}"]`
    )).filter((element) => element.getClientRects().length > 0)[occurrence] || null;

    const visibleControls = Array.from(document.querySelectorAll(
      'input, select, textarea, [role="combobox"], [aria-haspopup="listbox"]'
    ))
      .filter((element) => element.getClientRects().length > 0);
    const orderedControl = (position) => visibleControls[position] || null;
    const pilgrimOffset = index * 5;
    const generalOffset = Math.max(0, visibleControls.length - 5);
    const livePage = window.location.pathname.toLowerCase().includes('/agp/');
    const labeled = (labels, occurrence) => livePage
      ? findLabeledField(labels, occurrence)
      : null;

    const map = {
      name: () => findNamedField('name', index) || labeled(['name', 'full name'], index) || orderedControl(pilgrimOffset) || findField(section, [
        'input[name="name"]', 'input[name*="fullName" i]', 'input[id*="name" i]',
        'input[placeholder*="name" i]'
      ], ['full name', 'name']),
      gender: () => findNamedField('gender', index) || labeled(['gender'], index) || orderedControl(pilgrimOffset + 2) || findField(section, [
        'select[name="gender"]', '[name*="gender" i]', '[id*="gender" i]'
      ], ['gender']),
      age: () => findNamedField('age', index) || labeled(['age'], index) || orderedControl(pilgrimOffset + 1) || findField(section, [
        'input[name="age"]', 'input[name*="age" i]', 'input[id*="age" i]',
        'input[placeholder*="age" i]'
      ], ['age']),
      idType: () => findNamedField('idType', index) || labeled(['photo id proof', 'id proof type'], index) || orderedControl(pilgrimOffset + 3) || findField(section, [
        'select[name="idProofType"]', 'select[name="idType"]',
        '[name*="proof" i]', '[id*="proof" i]'
      ], ['id proof type', 'photo id proof', 'id proof']),
      idNumber: () => findNamedField('idNumber', index) || labeled(['photo id number', 'id proof number', 'id number'], index) || orderedControl(pilgrimOffset + 4) || findField(section, [
        'input[name="idProofNumber"]', 'input[name="idNumber"]',
        'input[name*="proofNumber" i]', 'input[id*="proofNumber" i]',
        'input[placeholder*="id number" i]'
      ], ['id proof number', 'id number'])
    };

    if (index === 0) {
      map.mobile = () => findField(contactSection, [
        'input[name="mobile"]', 'input[name*="mobile" i]', 'input[id*="mobile" i]',
        'input[placeholder*="mobile" i]'
      ], ['mobile number', 'mobile']);
      map.email = () => findNamedField('pilgrimEmail', 0) || labeled(['email address', 'email'], 0) || orderedControl(generalOffset) || findField(contactSection, [
        'input[type="email"]', 'input[name="email"]', 'input[name*="email" i]'
      ], ['email address', 'email']);
      map.city = () => findNamedField('pilgrimCity', 0) || labeled(['city'], 0) || orderedControl(generalOffset + 1) || findField(contactSection, [
        'input[name="city"]', 'input[name*="city" i]', 'input[id*="city" i]'
      ], ['city']);
      map.state = () => findNamedField('pilgrimState', 0) || labeled(['state'], 0) || orderedControl(generalOffset + 2) || findField(contactSection, [
        'input[name="state"]', 'input[name*="state" i]', 'input[id*="state" i]'
      ], ['state']);
      map.country = () => findNamedField('pilgrimCountry', 0) || labeled(['country'], 0) || orderedControl(generalOffset + 3) || findField(contactSection, [
        'input[name="country"]', 'input[name*="country" i]', 'input[id*="country" i]'
      ], ['country']);
      map.pincode = () => findNamedField('pilgrimPincode', 0) || labeled(['pincode', 'pin code'], 0) || orderedControl(generalOffset + 4) || findField(contactSection, [
        'input[name="pincode"]', 'input[name="zip"]', 'input[name*="pin" i]',
        'input[id*="pin" i]'
      ], ['pin code', 'pincode', 'zip code', 'pin']);
    }

    return map;
  },

  formatters: {
    gender: (val, element) => {
      if (element && element.tagName === 'SELECT') {
        for (let opt of element.options) {
          if (opt.text.trim().toLowerCase() === val.trim().toLowerCase() || opt.value.trim().toLowerCase() === val.trim().toLowerCase()) {
            return opt.value;
          }
        }
      }
      return val;
    },
    idType: (val, element) => {
      if (element && element.tagName === 'SELECT') {
        const normalized = val.replace(/\s+card$/i, '').trim().toLowerCase();
        const option = Array.from(element.options).find((opt) =>
          [opt.text, opt.value].some((candidate) => candidate.trim().toLowerCase().replace(/\s+card$/i, '') === normalized)
        );
        return option ? option.value : val;
      }
      return val;
    }
  }
};
