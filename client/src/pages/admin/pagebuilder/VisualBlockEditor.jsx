import { Plus, Trash, UploadSimple } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { uploadImage } from '../../../api/media.api';

// Field keys that should render as a multi-line textarea instead of a
// single-line input, since their values commonly hold '\n' line breaks.
const MULTILINE_KEYS = new Set(['heading', 'subtext', 'quote', 'description']);

// Known enum fields: { fieldKey: [options] }
const ENUM_OPTIONS = {
  style: ['primary', 'secondary'],
  source: ['manual', 'tag', 'category'],
};

// Template for a new item when "+ Add" is clicked on an array field that's
// currently empty (so we still know each item's shape).
const ARRAY_ITEM_TEMPLATES = {
  ctaButtons: { label: '', link: '', style: 'primary' },
  items: { title: '', subtitle: '' },
  testimonials: { quote: '', author: '', image: '' },
  messages: '',
  productIds: '',
};

// Image fields whose value isn't actually rendered by the block's current
// design (each of these blocks hardcodes its own bundled brand photo) -
// shown anyway for parity with the JSON editor, with an explanatory note.
const INERT_IMAGE_FIELDS = new Set(['hero.image', 'giftBanner.image', 'testimonials.image']);

function isImageKey(key) {
  return /image$/i.test(key);
}

function FieldRow({ label, children }) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function ImageField({ label, value, onChange, inert }) {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      onChange(res.data.url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <FieldRow label={label}>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
        {value && (
          <img src={value} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', flexShrink: 0 }} />
        )}
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" style={{ flex: 1 }} />
        <label className="btn btn--sm btn--secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <UploadSimple size={14} weight="bold" />
          Upload
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>
      {inert && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 'var(--space-xs)' }}>
          This block's current design doesn't display this image.
        </p>
      )}
    </FieldRow>
  );
}

function EnumField({ label, value, options, onChange }) {
  return (
    <FieldRow label={label}>
      <select value={value || options[0]} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </FieldRow>
  );
}

function ArrayOfStringsField({ label, items = [], onChange }) {
  const update = (i, v) => { const next = [...items]; next[i] = v; onChange(next); };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <FieldRow label={label}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {items.map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            <input value={item} onChange={(e) => update(i, e.target.value)} style={{ flex: 1 }} />
            <button type="button" className="icon-btn icon-btn--danger" onClick={() => remove(i)}>
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--sm btn--secondary" style={{ marginTop: 'var(--space-xs)', alignSelf: 'flex-start' }} onClick={add}>
        <Plus size={14} weight="bold" style={{ verticalAlign: '-2px', marginRight: 4 }} />
        Add
      </button>
    </FieldRow>
  );
}

function ArrayOfObjectsField({ blockType, fieldKey, label, items = [], onChange }) {
  const template = ARRAY_ITEM_TEMPLATES[fieldKey] || {};
  const update = (i, next) => { const copy = [...items]; copy[i] = next; onChange(copy); };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { ...template }]);

  return (
    <FieldRow label={label}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {items.map((item, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="admin-card"
            style={{ padding: 'var(--space-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="icon-btn icon-btn--danger" onClick={() => remove(i)}>
                <Trash size={16} />
              </button>
            </div>
            {Object.entries(item).map(([subKey, subVal]) => (
              <FieldGenerator
                key={subKey}
                blockType={blockType}
                parentKey={fieldKey}
                fieldKey={subKey}
                value={subVal}
                onChange={(v) => update(i, { ...item, [subKey]: v })}
              />
            ))}
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--sm btn--secondary" style={{ marginTop: 'var(--space-sm)', alignSelf: 'flex-start' }} onClick={add}>
        <Plus size={14} weight="bold" style={{ verticalAlign: '-2px', marginRight: 4 }} />
        Add
      </button>
    </FieldRow>
  );
}

// Renders a single field, dispatching to the right input type based on the
// field's key name and current value's JS type.
function FieldGenerator({ blockType, parentKey, fieldKey, value, onChange }) {
  const label = fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

  if (isImageKey(fieldKey)) {
    const inert = INERT_IMAGE_FIELDS.has(`${blockType}.${fieldKey}`) || INERT_IMAGE_FIELDS.has(`${parentKey}.${fieldKey}`);
    return <ImageField label={label} value={value} onChange={onChange} inert={inert} />;
  }

  if (ENUM_OPTIONS[fieldKey]) {
    return <EnumField label={label} value={value} options={ENUM_OPTIONS[fieldKey]} onChange={onChange} />;
  }

  if (Array.isArray(value)) {
    const isObjectArray = value.length > 0 ? typeof value[0] === 'object' : ARRAY_ITEM_TEMPLATES[fieldKey] && typeof ARRAY_ITEM_TEMPLATES[fieldKey] === 'object';
    return isObjectArray
      ? <ArrayOfObjectsField blockType={blockType} fieldKey={fieldKey} label={label} items={value} onChange={onChange} />
      : <ArrayOfStringsField label={label} items={value} onChange={onChange} />;
  }

  if (typeof value === 'number') {
    return (
      <FieldRow label={label}>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </FieldRow>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <FieldRow label={label}>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} style={{ width: 20, height: 20 }} />
      </FieldRow>
    );
  }

  // string (default)
  return (
    <FieldRow label={label}>
      {MULTILINE_KEYS.has(fieldKey)
        ? <textarea rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} />
        : <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />}
    </FieldRow>
  );
}

const PRODUCT_GRID_SOURCE_FIELD = { manual: 'productIds', tag: 'tag', category: 'category' };

function ProductGridFields({ value, onChange }) {
  const source = value.source || 'manual';
  const conditionalKey = PRODUCT_GRID_SOURCE_FIELD[source];
  const conditionalValue = value[conditionalKey] ?? (conditionalKey === 'productIds' ? [] : '');

  return (
    <>
      <FieldGenerator blockType="productGrid" fieldKey="title" value={value.title || ''} onChange={(v) => onChange({ ...value, title: v })} />
      <EnumField label="Source" value={source} options={['manual', 'tag', 'category']} onChange={(v) => onChange({ ...value, source: v })} />
      <FieldGenerator blockType="productGrid" fieldKey={conditionalKey} value={conditionalValue} onChange={(v) => onChange({ ...value, [conditionalKey]: v })} />
      <FieldGenerator blockType="productGrid" fieldKey="limit" value={value.limit ?? 4} onChange={(v) => onChange({ ...value, limit: v })} />
    </>
  );
}

function VisualBlockEditor({ blockType, value, onChange }) {
  const setField = (key, v) => onChange({ ...value, [key]: v });

  if (blockType === 'productGrid') {
    return <ProductGridFields value={value} onChange={onChange} />;
  }

  const keys = Object.keys(value);
  if (keys.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)' }}>This block has no editable fields.</p>;
  }

  return (
    <>
      {keys.map((key) => (
        <FieldGenerator key={key} blockType={blockType} fieldKey={key} value={value[key]} onChange={(v) => setField(key, v)} />
      ))}
    </>
  );
}

export default VisualBlockEditor;
