const AutofillEngine = {
  fill(profiles, adapter) {
    // Ensure profiles is an array to support multiple pilgrims
    if (!Array.isArray(profiles)) {
      profiles = [profiles];
    }

    const startTime = performance.now();
    let stats = {
      found: 0,
      filled: 0,
      missingCount: 0,
      missingFields: [],
      duration: 0
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

          this.setElementValue(element, valueToFill);
          stats.filled++;
        } else {
          // If we can't find contact fields for Pilgrim > 0, it's normal (they appear once)
          // But we will log them for transparency.
          stats.missingCount++;
          stats.missingFields.push(`${key}(P${index + 1})`);
          console.warn(`[TicketAssist] Could not identify field: ${key} for Pilgrim ${index + 1}`);
        }
      }
    });

    const endTime = performance.now();
    stats.duration = endTime - startTime;
    return stats;
  },

  setElementValue(element, value) {
    element.focus();

    if (element.tagName === 'SELECT') {
      element.value = value;
    } else if (element.type === 'checkbox' || element.type === 'radio') {
      // Handling checkboxes if needed
    } else {
      element.value = value;
    }

    // Dispatch events to trigger JS frameworks
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
  }
};
