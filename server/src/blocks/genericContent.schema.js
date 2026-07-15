// Validates props for "content" blocks that hold a page's remaining static
// strings (contact info, disclaimers, usage text, empty-state copy) but
// aren't rendered as a visual section by PageRenderer - the owning page
// component reads these props directly. Registered under several blockType
// keys (see server/src/blocks/index.js); lenient by design since the shape
// varies per page.
function validate(props = {}) {
  const errors = [];
  if (typeof props !== 'object' || props === null || Array.isArray(props)) {
    errors.push('props must be an object');
  }
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
