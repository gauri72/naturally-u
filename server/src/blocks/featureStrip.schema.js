// e.g. "Pure & Safe / Made with Love / Sustainable / For Every Skin" strip
function validate(props = {}) {
  const errors = [];
  if (!Array.isArray(props.items)) errors.push('items must be an array');
  else props.items.forEach((item, i) => {
    if (!item.title) errors.push(`items[${i}].title is required`);
  });
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
