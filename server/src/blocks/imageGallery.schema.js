// Validates props for the ImageGallery block (responsive image grid)
function validate(props = {}) {
  const errors = [];
  if (!Array.isArray(props.images) || props.images.length === 0) {
    errors.push('images must be a non-empty array');
  } else if (props.images.some((img) => !img || !img.url)) {
    errors.push('every image must have a url');
  }
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
