const AutofillEngine = {
  async fill(profiles, adapter) {
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

    for (const [index, profile] of profiles.entries()) {
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
          const result = await this.setElementValue(element, valueToFill);
          stats.timing.domWrites += performance.now() - writeStart;
          if (result.verified) {
            stats.filled++;
          } else {
            stats.missingCount++;
            stats.missingFields.push(`${this.fieldLabel(key)}(P${index + 1}) - ${result.reason}`);
          }
        } else {
          stats.missingCount++;
          stats.missingFields.push(`${this.fieldLabel(key)}(P${index + 1}) - field not found`);
        }
      }
    }

    const endTime = performance.now();
    stats.timing.scan = endTime - scanStart - stats.timing.domWrites;
    stats.timing.fieldsCompleted = endTime - startTime;
    stats.duration = endTime - startTime;
    return stats;
  },

  fieldLabel(key) {
    return { idType: 'ID Proof Type', idNumber: 'ID Proof Number', pincode: 'PIN Code' }[key] || key.charAt(0).toUpperCase() + key.slice(1);
  },

  async setElementValue(element, value) {
    element.focus();

    if (element.tagName === 'SELECT') {
      element.value = value;
      if (element.value !== value) {
        return { verified: false, reason: 'no matching option' };
      }
    } else if (element.getAttribute('role') === 'combobox' ||
      element.getAttribute('aria-haspopup') === 'listbox') {
      element.click();
      const normalizeOption = (text) => text
        .replace(/\s+card$/i, '')
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase();
      const normalizedValue = normalizeOption(String(value));
      let option = null;
      for (let attempt = 0; attempt < 10 && !option; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        option = Array.from(document.querySelectorAll('[role="option"], mat-option'))
          .find((candidate) => normalizeOption(
            candidate.getAttribute('aria-label') || candidate.textContent
          ) === normalizedValue);
      }
      if (!option) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return { verified: false, reason: 'no matching option' };
      }
      option.click();
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
    const verified = element.getAttribute('role') === 'combobox' ||
      element.getAttribute('aria-haspopup') === 'listbox'
      ? element.textContent.trim().toLowerCase().includes(String(value).trim().toLowerCase())
      : element.type === 'checkbox' || element.type === 'radio'
      ? element.checked
      : element.value === String(value);
    return {
      verified,
      reason: verified ? '' : 'page changed the value'
    };
  }
};
