// adapters/ttd.js
// Website Adapter for TTD Angapradakshinam (and mock page)

const TTDAdapter = {
  name: "TTD",
  
  // Maps standard profile keys to a function that locates the DOM element
  fieldMap: {
    name: () => document.querySelector('input[name="name"], input#name, input[placeholder*="Name" i]'),
    gender: () => document.querySelector('select[name="gender"], select#gender'),
    age: () => document.querySelector('input[name="age"], input#age'),
    idType: () => document.querySelector('select[name="idProofType"], select#idProofType, select#idType'),
    idNumber: () => document.querySelector('input[name="idProofNumber"], input#idProofNumber, input#idNumber'),
    mobile: () => document.querySelector('input[name="mobile"], input#mobile, input[placeholder*="Mobile" i]'),
    city: () => document.querySelector('input[name="city"], input#city'),
    state: () => document.querySelector('input[name="state"], input#state'),
    pincode: () => document.querySelector('input[name="pincode"], input#pincode, input[name="zip"]')
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
