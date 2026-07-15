// Validates props for the AboutContact block (the About page's
// "Want to know more? Write to us!" contact details section)
function validate(props = {}) {
  const errors = [];
  if (!props.heading) errors.push('heading is required');
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
