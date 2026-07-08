function validate(props = {}) {
  const errors = [];
  if (!Array.isArray(props.testimonials)) errors.push('testimonials must be an array');
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
