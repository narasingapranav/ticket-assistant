// content/autofill.js

const AutofillEngine = {
  fill(profile, adapter) {
    const startTime = performance.now();
    let stats = {
      found: 0,
      filled: 0,
      missingCount: 0,
      missingFields: [],
      duration: 0
    };

    const keysToFill = Object.keys(adapter.fieldMap);

    for (let key of keysToFill) {
      if (!profile[key]) continue; // If profile doesn't have it, skip
      
      const element = adapter.fieldMap[key]();
      
      if (element) {
        stats.found++;
        
        let valueToFill = profile[key];
        if (adapter.formatters && adapter.formatters[key]) {
          valueToFill = adapter.formatters[key](valueToFill, element);
        }

        this.setElementValue(element, valueToFill);
        stats.filled++;
      } else {
        stats.missingCount++;
        stats.missingFields.push(key);
        console.warn(`[TicketAssist] Could not confidently identify field: ${key}`);
      }
    }

    const endTime = performance.now();
    stats.duration = endTime - startTime;
    return stats;
  },

  setElementValue(element, value) {
    element.focus();

    if (element.tagName === 'SELECT') {
      element.value = value;
    } else if (element.type === 'checkbox' || element.type === 'radio') {
      // Handling checkboxes if needed in future
    } else {
      element.value = value;
    }

    // Dispatch events to trigger JS frameworks (React, Angular, etc.)
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
  }
};
