// Validates props for the AboutFeature block (image + text feature section,
// reused 3x on the About the Maker page)
function validate(props = {}) {
  const errors = [];
  if (!props.body) errors.push('body is required');
  if (!props.image) errors.push('image is required');
  if (props.ctaLabel && !props.ctaLink) errors.push('ctaLink is required when ctaLabel is set');
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
