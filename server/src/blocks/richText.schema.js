// Validates props for the RichText block (prose section with optional
// image and CTA, used by content migrated from the old site)
function validate(props = {}) {
  const errors = [];
  if (!props.heading && !props.body) errors.push('heading or body is required');
  if (props.ctaLabel && !props.ctaLink) errors.push('ctaLink is required when ctaLabel is set');
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
