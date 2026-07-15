// Validates props for the IconCards block (icon+title+text card grid, reused
// for the About "values" grid, Workshops' 3-card grid, and Shipping &
// Returns' 2-card grid, distinguished by `variant`)
function validate(props = {}) {
  const errors = [];
  if (!Array.isArray(props.items) || props.items.length === 0) {
    errors.push('items must be a non-empty array');
  } else if (props.items.some((item) => !item || !item.title)) {
    errors.push('every item must have a title');
  }
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
