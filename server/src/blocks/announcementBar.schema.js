function validate(props = {}) {
  const errors = [];
  if (props.messages && !Array.isArray(props.messages)) errors.push('messages must be an array');
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
