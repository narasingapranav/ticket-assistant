// Selectors unverified until tested on the live form.
const TTDAdapter = {
  name: "TTD",

  isFormPresent() {
    return !!document.querySelector('form#bookingForm, form[action*="booking" i]');
  },

  fieldMap: (index) => {
    const pilgrimSections = document.querySelectorAll('.pilgrim-section, [data-pilgrim]');
    const section = pilgrimSections[index];
    const contactSection = document.querySelector('.contact-section, [data-contact-section]');

    const findField = (root, selectors, labels) => {
      if (!root) return null;
      for (const selector of selectors) {
        const element = root.querySelector(selector);
        if (element) return element;
      }
      const label = Array.from(root.querySelectorAll('label')).find((candidate) =>
        labels.some((text) => candidate.textContent.trim().toLowerCase() === text)
      );
      return label ? label.control || label.parentElement.querySelector('input, select, textarea') : null;
    };

    const map = {
      name: () => findField(section, ['input[name="name"]'], ['full name', 'name']),
      gender: () => findField(section, ['select[name="gender"]'], ['gender']),
      age: () => findField(section, ['input[name="age"]'], ['age']),
      idType: () => findField(section, ['select[name="idProofType"]', 'select[name="idType"]'], ['id proof type', 'photo id proof']),
      idNumber: () => findField(section, ['input[name="idProofNumber"]', 'input[name="idNumber"]'], ['id proof number', 'id number'])
    };

    if (index === 0) {
      map.mobile = () => findField(contactSection, ['input[name="mobile"]'], ['mobile number']);
      map.email = () => findField(contactSection, ['input[type="email"]', 'input[name="email"]'], ['email address']);
      map.city = () => findField(contactSection, ['input[name="city"]'], ['city']);
      map.state = () => findField(contactSection, ['input[name="state"]'], ['state']);
      map.country = () => findField(contactSection, ['input[name="country"]'], ['country']);
      map.pincode = () => findField(contactSection, ['input[name="pincode"]', 'input[name="zip"]'], ['pin code', 'pincode', 'zip code']);
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
