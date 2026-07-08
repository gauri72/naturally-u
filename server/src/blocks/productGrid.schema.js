// Bestsellers-style grid. Can reference products by ID or by a query (e.g. tag: 'bestseller')
function validate(props = {}) {
  const errors = [];
  if (!props.title) errors.push('title is required');
  if (!props.source || !['manual', 'tag', 'category'].includes(props.source)) {
    errors.push('source must be one of manual|tag|category');
  }
  return { error: errors.length ? errors.join(', ') : null, value: props };
}

module.exports = validate;
