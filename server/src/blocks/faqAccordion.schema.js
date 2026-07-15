// Validates props for the FaqAccordion block (question/answer list on the
// FAQ page)
function validate(props = {}) {
  const errors = [];
  if (!Array.isArray(props.items) || props.items.length === 0) {
    errors.push('items must be a non-empty array');
  } else if (props.items.some((item) => !item || !item.question || !item.answer)) {
    errors.push('every item must have a question and answer');
  }
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
