// Validates props for the Hero block (headline, subtext, CTA buttons, image)
function validate(props = {}) {
  const errors = [];
  if (!props.heading) errors.push('heading is required');
  if (!props.image) errors.push('image is required');
  if (props.ctaButtons && !Array.isArray(props.ctaButtons)) {
    errors.push('ctaButtons must be an array');
  }
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
