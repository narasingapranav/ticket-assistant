const AutofillEngine = {
  fill(profiles, adapter) {
    // Ensure profiles is an array to support multiple pilgrims
    if (!Array.isArray(profiles)) {
      profiles = [profiles];
    }

    const startTime = performance.now();
    const scanStart = startTime;
    let stats = {
      found: 0,
      filled: 0,
      missingCount: 0,
      missingFields: [],
      duration: 0,
      timing: { scan: 0, domWrites: 0, fieldsCompleted: 0 }
    };

    profiles.forEach((profile, index) => {
      // Determine if fieldMap is a function (multi-user) or object (single-user legacy)
      const fieldMap = typeof adapter.fieldMap === 'function' 
        ? adapter.fieldMap(index) 
        : adapter.fieldMap;

      const keysToFill = Object.keys(fieldMap);

      for (let key of keysToFill) {
        if (!profile[key]) continue;
        
        const element = fieldMap[key]();
        
        if (element) {
          stats.found++;
          let valueToFill = profile[key];
          if (adapter.formatters && adapter.formatters[key]) {
            valueToFill = adapter.formatters[key](valueToFill, element);
          }

          const writeStart = performance.now();
          const verified = this.setElementValue(element, valueToFill);
          stats.timing.domWrites += performance.now() - writeStart;
          if (verified) {
            stats.filled++;
          } else {
            stats.missingCount++;
            stats.missingFields.push(`${this.fieldLabel(key)}(P${index + 1})`);
          }
        } else {
          stats.missingCount++;
          stats.missingFields.push(`${this.fieldLabel(key)}(P${index + 1})`);
        }
      }
    });

    const endTime = performance.now();
    stats.timing.scan = endTime - scanStart - stats.timing.domWrites;
    stats.timing.fieldsCompleted = endTime - startTime;
    stats.duration = endTime - startTime;
    return stats;
  },

  fieldLabel(key) {
    return { idType: 'ID Proof Type', idNumber: 'ID Proof Number', pincode: 'PIN Code' }[key] || key.charAt(0).toUpperCase() + key.slice(1);
  },

  setElementValue(element, value) {
    element.focus();

    if (element.tagName === 'SELECT') {
      element.value = value;
      if (element.value !== value) return false;
    } else if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = true;
    } else {
      const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value')?.set ||
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      if (setter) setter.call(element, value);
      else element.value = value;
    }

    // Dispatch events to trigger JS frameworks
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
    return element.type === 'checkbox' || element.type === 'radio' ? element.checked : element.value === String(value);
  }
};
