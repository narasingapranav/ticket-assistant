const TTDAdapter = {
  name: "TTD",
  
  fieldMap: (index) => {
    // These fields are expected for every pilgrim
    const map = {
      name: () => document.querySelectorAll('input[name="name"], input[placeholder*="Name" i]')[index],
      gender: () => document.querySelectorAll('select[name="gender"]')[index],
      age: () => document.querySelectorAll('input[name="age"]')[index],
      idType: () => document.querySelectorAll('select[name="idProofType"], select[name="idType"]')[index],
      idNumber: () => document.querySelectorAll('input[name="idProofNumber"], input[name="idNumber"]')[index]
    };

    // Contact details only appear once on the form, so we ONLY map them for the first selected profile (Pilgrim 1).
    // This prevents Pilgrim 2 from overwriting Pilgrim 1's contact info, and stops the engine from falsely reporting them as "missing" for Pilgrim 2.
    if (index === 0) {
      map.mobile = () => document.querySelectorAll('input[name="mobile"], input[placeholder*="Mobile" i]')[0];
      map.email = () => document.querySelectorAll('input[type="email"], input[name="email"], input[name="gmail"], input[placeholder*="Email" i], input[placeholder*="Gmail" i]')[0];
      map.city = () => document.querySelectorAll('input[name="city"]')[0];
      map.state = () => document.querySelectorAll('input[name="state"]')[0];
      map.country = () => document.querySelectorAll('input[name="country"]')[0];
      map.pincode = () => document.querySelectorAll('input[name="pincode"], input[name="zip"]')[0];
    }

    return map;
  },

  formatters: {
    gender: (val, element) => {
      if (element && element.tagName === 'SELECT') {
        for (let opt of element.options) {
          if (opt.text.toLowerCase() === val.toLowerCase() || opt.value.toLowerCase() === val.toLowerCase()) {
            return opt.value;
          }
        }
      }
      return val;
    }
  }
};
