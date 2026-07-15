// Validates props for the LegalSection block (one titled prose section on
// the Privacy Policy / Terms pages)
function validate(props = {}) {
  const errors = [];
  if (!props.heading) errors.push('heading is required');
  if (!props.body) errors.push('body is required');
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
