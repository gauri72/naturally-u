// Validates props for the PageHero block (simple heading/subtext hero,
// reused across several interior pages via `variant`)
function validate(props = {}) {
  const errors = [];
  if (!props.heading) errors.push('heading is required');
  if (props.ctaLabel && !props.ctaLink) errors.push('ctaLink is required when ctaLabel is set');
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
