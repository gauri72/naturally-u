import { Plus, Trash, UploadSimple, CaretUp, CaretDown } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { uploadImage } from '../../../api/media.api';
import './VisualBlockEditor.css';

// Field keys that hold prose and should render as a textarea. Suffix match,
// so it also catches taxNote, shippingNoteText, emptyPromptText, etc.
const MULTILINE_RE = /(body|quote|description|answer|subtext|blurb|note|text|usage|heading)$/i;

// Acronyms the camelCase -> label humanizer should keep uppercased
const ACRONYMS = { cta: 'CTA', url: 'URL', id: 'ID', faq: 'FAQ' };

const humanizeKey = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .split(' ')
    .map((word) => ACRONYMS[word.toLowerCase()] || word)
    .join(' ');

// Known enum fields. Keys are matched most-specific first:
// "<blockType>.<parentKey>.<field>", "<blockType>.<field>",
// "<parentKey>.<field>", then bare "<field>". Values mirror exactly what
// each block component supports - keeping these lists in sync with the
// component prevents typos that would silently fall back to a default look.
const ENUM_OPTIONS = {
  style: ['primary', 'secondary'],
  source: ['manual', 'tag', 'category'],
  'richText.variant': ['default', 'feature', 'story', 'section-title', 'pledge', 'disclaimer'],
  'imageGallery.variant': ['default', 'story'],
  'pageHero.variant': ['plain', 'about-maker', 'workshops', 'contact', 'gift-sets', 'legal', 'track-order', 'faq', 'shipping-returns', 'cart', 'checkout'],
  'pageHero.icon': ['', 'package', 'shopping-bag'],
  'aboutStory.variant': ['plain', 'whats-next', 'vision'],
  'iconCards.variant': ['about-values', 'workshops', 'shipping-returns'],
  'ctaRow.variant': ['about-maker', 'workshops'],
  'aboutFeature.eyebrowIcon': ['sealcheck', 'handheart'],
  'iconCards.items.icon': ['handheart', 'leaf', 'sparkle', 'usersthree', 'cake', 'truck', 'arrowuupleft'],
};

const enumOptionsFor = (blockType, parentKey, fieldKey) =>
  ENUM_OPTIONS[`${blockType}.${parentKey}.${fieldKey}`]
  || ENUM_OPTIONS[`${blockType}.${fieldKey}`]
  || ENUM_OPTIONS[`${parentKey}.${fieldKey}`]
  || ENUM_OPTIONS[fieldKey];

// Short helper text shown under fields whose purpose isn't obvious
const FIELD_HINTS = {
  variant: 'Which visual style this section uses on the storefront.',
  ctaLink: 'Site path the button opens, e.g. /shop',
  link: 'Site path, e.g. /contact',
  imageAlt: 'Describes the image for screen readers and SEO.',
  reverse: 'Show the image on the left instead of the right.',
};

// Template for a new item when "+ Add" is clicked on an array field that's
// currently empty (so we still know each item's shape). Same most-specific-
// first lookup as ENUM_OPTIONS.
const ARRAY_ITEM_TEMPLATES = {
  ctaButtons: { label: '', link: '', style: 'primary' },
  items: { title: '', subtitle: '' },
  testimonials: { quote: '', author: '', image: '' },
  messages: '',
  productIds: '',
  buttons: { label: '', link: '', style: 'primary' },
  'iconCards.items': { icon: 'handheart', title: '', text: '' },
  'faqAccordion.items': { question: '', answer: '' },
};

// Image fields whose value isn't actually rendered by the block's current
// design (each of these blocks hardcodes its own bundled brand photo) -
// shown anyway for parity with the JSON editor, with an explanatory note.
const INERT_IMAGE_FIELDS = new Set(['hero.image', 'giftBanner.image', 'testimonials.image']);

function isImageKey(key) {
  return /image$/i.test(key);
}

function FieldRow({ label, hint, children }) {
  return (
    <div className="admin-field vbe-field">
      <label>{label}</label>
      {children}
      {hint && <p className="vbe-hint">{hint}</p>}
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
    <FieldRow label={label} hint={inert ? "This block's current design doesn't display this image." : undefined}>
      <div className="vbe-image-row">
        {value ? (
          <img src={value} alt="" className="vbe-image-preview" />
        ) : (
          <span className="vbe-image-preview vbe-image-preview--empty">—</span>
        )}
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
        <label className="btn btn--sm btn--secondary vbe-upload-btn">
          <UploadSimple size={14} weight="bold" />
          Upload
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>
    </FieldRow>
  );
}

function EnumField({ label, value, options, onChange, hint }) {
  return (
    <FieldRow label={label} hint={hint}>
      <select value={value ?? options[0]} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => <option key={opt} value={opt}>{opt === '' ? '(none)' : opt}</option>)}
      </select>
    </FieldRow>
  );
}

function BooleanField({ label, value, onChange, hint }) {
  return (
    <div className="admin-field vbe-field">
      <label className="vbe-toggle-row">
        <input
          type="checkbox"
          className="vbe-toggle"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{label}</span>
      </label>
      {hint && <p className="vbe-hint">{hint}</p>}
    </div>
  );
}

function ArrayOfStringsField({ label, items = [], onChange }) {
  const update = (i, v) => { const next = [...items]; next[i] = v; onChange(next); };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <FieldRow label={label}>
      <div className="vbe-string-list">
        {items.map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="vbe-string-list__row">
            <input value={item} onChange={(e) => update(i, e.target.value)} />
            <button type="button" className="icon-btn icon-btn--danger" onClick={() => remove(i)} title="Remove">
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--sm btn--secondary vbe-add-btn" onClick={add}>
        <Plus size={14} weight="bold" /> Add
      </button>
    </FieldRow>
  );
}

// Best-effort one-line preview of an array item for its card header
const itemPreview = (item) => {
  const preferred = item.title || item.label || item.question || item.author || item.heading;
  if (preferred) return preferred;
  const firstString = Object.values(item).find((v) => typeof v === 'string' && v.trim());
  return firstString || '';
};

function ArrayOfObjectsField({ blockType, fieldKey, label, items = [], onChange }) {
  const template = ARRAY_ITEM_TEMPLATES[`${blockType}.${fieldKey}`] || ARRAY_ITEM_TEMPLATES[fieldKey] || {};
  const update = (i, next) => { const copy = [...items]; copy[i] = next; onChange(copy); };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { ...template }]);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  return (
    <FieldRow label={`${label} (${items.length})`}>
      <div className="vbe-item-list">
        {items.map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="vbe-item">
            <div className="vbe-item__head">
              <span className="vbe-item__index">{i + 1}</span>
              <span className="vbe-item__title">{itemPreview(item)}</span>
              <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} title="Move up">
                <CaretUp size={14} weight="bold" />
              </button>
              <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} title="Move down">
                <CaretDown size={14} weight="bold" />
              </button>
              <button type="button" className="icon-btn icon-btn--danger" onClick={() => remove(i)} title="Remove item">
                <Trash size={16} />
              </button>
            </div>
            <div className="vbe-item__body">
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
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--sm btn--secondary vbe-add-btn" onClick={add}>
        <Plus size={14} weight="bold" /> Add item
      </button>
    </FieldRow>
  );
}

// Renders a single field, dispatching to the right input type based on the
// field's key name and current value's JS type.
function FieldGenerator({ blockType, parentKey = '', fieldKey, value, onChange }) {
  const label = humanizeKey(fieldKey);
  const hint = FIELD_HINTS[fieldKey];

  if (isImageKey(fieldKey)) {
    const inert = INERT_IMAGE_FIELDS.has(`${blockType}.${fieldKey}`) || INERT_IMAGE_FIELDS.has(`${parentKey}.${fieldKey}`);
    return <ImageField label={label} value={value} onChange={onChange} inert={inert} />;
  }

  const enumOptions = enumOptionsFor(blockType, parentKey, fieldKey);
  if (enumOptions) {
    return <EnumField label={label} value={value} options={enumOptions} onChange={onChange} hint={hint} />;
  }

  if (Array.isArray(value)) {
    const template = ARRAY_ITEM_TEMPLATES[`${blockType}.${fieldKey}`] || ARRAY_ITEM_TEMPLATES[fieldKey];
    const isObjectArray = value.length > 0 ? typeof value[0] === 'object' : template && typeof template === 'object';
    return isObjectArray
      ? <ArrayOfObjectsField blockType={blockType} fieldKey={fieldKey} label={label} items={value} onChange={onChange} />
      : <ArrayOfStringsField label={label} items={value} onChange={onChange} />;
  }

  if (typeof value === 'number') {
    return (
      <FieldRow label={label} hint={hint}>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </FieldRow>
    );
  }

  if (typeof value === 'boolean') {
    return <BooleanField label={label} value={value} onChange={onChange} hint={hint} />;
  }

  // string (default); prose-like keys get a textarea sized to their content
  if (MULTILINE_RE.test(fieldKey)) {
    const rows = Math.max(2, Math.min(10, Math.ceil((value || '').length / 70)));
    return (
      <FieldRow label={label} hint={hint}>
        <textarea rows={rows} value={value || ''} onChange={(e) => onChange(e.target.value)} />
      </FieldRow>
    );
  }

  return (
    <FieldRow label={label} hint={hint}>
      <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
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
      <EnumField
        label="Source"
        value={source}
        options={ENUM_OPTIONS.source}
        onChange={(v) => onChange({ ...value, source: v })}
        hint="How this grid picks its products."
      />
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

  // Underscore-prefixed keys (e.g. _migrationId) are internal bookkeeping:
  // hidden from the form but preserved on save since setField spreads the
  // full value. They remain inspectable in the Code tab.
  const keys = Object.keys(value).filter((k) => !k.startsWith('_'));
  if (keys.length === 0) {
    return <p className="vbe-empty">This block has no editable fields.</p>;
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
