function validate(props = {}) {
  const errors = [];
  if (!props.heading) errors.push('heading is required');
  if (!props.image) errors.push('image is required');
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
