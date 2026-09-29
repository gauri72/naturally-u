// The Shop page's "Products" section: an optional heading/subheading +
// live product carousel. Product filtering/sorting itself stays reactive
// to the page's own URL params (tag/category/search/sort) on the client
// side - every prop here is cosmetic/copy, so nothing is required.
const STRING_FIELDS = ['heading', 'subheading'];

function validate(props = {}) {
  const errors = [];
  if (typeof props !== 'object' || props === null || Array.isArray(props)) {
    errors.push('props must be an object');
    return { error: errors.join(', '), value: props };
  }

  for (const key of STRING_FIELDS) {
    if (props[key] !== undefined && typeof props[key] !== 'string') errors.push(`${key} must be a string`);
  }

  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
