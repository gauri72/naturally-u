// Validates props for the CtaRow block (a heading/body + one or more
// buttons, reused for the About page's closing CTA and the Workshops page's
// booking CTA, distinguished by `variant`)
function validate(props = {}) {
  const errors = [];
  if (!Array.isArray(props.buttons) || props.buttons.length === 0) {
    errors.push('buttons must be a non-empty array');
  } else if (props.buttons.some((b) => !b || !b.label || !b.link)) {
    errors.push('every button must have a label and link');
  }
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
