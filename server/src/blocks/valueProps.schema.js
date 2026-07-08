// "Natural Ingredients / Handcrafted / Real Results / Global Love" row
function validate(props = {}) {
  const errors = [];
  if (!Array.isArray(props.items)) errors.push('items must be an array');
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
