// Validates props for the AboutStory block (centered narrative section,
// reused for the "born" / "how-made" / "what's next" / "vision" sections
// on the About the Maker page)
function validate(props = {}) {
  const errors = [];
  if (!props.heading) errors.push('heading is required');
  if (!props.body) errors.push('body is required');
  if (props.ctaLabel && !props.ctaLink) errors.push('ctaLink is required when ctaLabel is set');
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
