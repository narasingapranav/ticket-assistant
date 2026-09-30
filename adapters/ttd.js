const TTDAdapter = {
  name: "TTD",
  
  // fieldMap is now a function that takes the index of the pilgrim
  // This allows the autofill engine to find fields for Pilgrim 1 (index 0), Pilgrim 2 (index 1), etc.
  fieldMap: (index) => ({
    name: () => document.querySelectorAll('input[name="name"], input[placeholder*="Name" i]')[index],
    gender: () => document.querySelectorAll('select[name="gender"]')[index],
    age: () => document.querySelectorAll('input[name="age"]')[index],
    idType: () => document.querySelectorAll('select[name="idProofType"], select[name="idType"]')[index],
    idNumber: () => document.querySelectorAll('input[name="idProofNumber"], input[name="idNumber"]')[index],
    // Contact details typically only appear once per booking form, so we always target index 0
    mobile: () => document.querySelectorAll('input[name="mobile"], input[placeholder*="Mobile" i]')[0],
    city: () => document.querySelectorAll('input[name="city"]')[0],
    state: () => document.querySelectorAll('input[name="state"]')[0],
    pincode: () => document.querySelectorAll('input[name="pincode"], input[name="zip"]')[0]
  }),

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
