import { Plus, Trash, UploadSimple, CaretUp, CaretDown } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { uploadImage } from '../../../api/media.api';
import { useLang } from '../../../i18n/LanguageContext.jsx';
import './VisualBlockEditor.css';

// Field keys that hold prose and should render as a textarea. Suffix match,
// so it also catches taxNote, shippingNoteText, emptyPromptText, etc.
const MULTILINE_RE = /(body|quote|description|answer|subtext|subheading|blurb|note|text|usage|heading)$/i;

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

const lookup = (map, blockType, parentKey, fieldKey) =>
  map[`${blockType}.${parentKey}.${fieldKey}`]
  || map[`${blockType}.${fieldKey}`]
  || map[`${parentKey}.${fieldKey}`]
  || map[fieldKey];

const enumOptionsFor = (blockType, parentKey, fieldKey) => lookup(ENUM_OPTIONS, blockType, parentKey, fieldKey);

// Friendly display names for enum values, same lookup as ENUM_OPTIONS.
// Enums without an entry here show their raw value.
const ICON_LABELS = {
  handheart: 'Heart in hand', leaf: 'Leaf', sparkle: 'Sparkle', usersthree: 'People',
  cake: 'Cake', truck: 'Truck', arrowuupleft: 'Return arrow', sealcheck: 'Seal check',
};
const OPTION_LABELS = {
  style: { primary: 'Primary', secondary: 'Secondary' },
  'aboutStory.variant': { plain: 'Standard', vision: 'Highlighted band', 'whats-next': 'Closing call to action' },
  'aboutFeature.eyebrowIcon': ICON_LABELS,
  'iconCards.items.icon': ICON_LABELS,
};

const optionLabelsFor = (blockType, parentKey, fieldKey) => lookup(OPTION_LABELS, blockType, parentKey, fieldKey);

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
  const { t } = useLang();
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      onChange(res.data.url);
      toast.success(t('Image uploaded'));
    } catch {
      toast.error(t('Upload failed'));
    } finally {
      e.target.value = '';
    }
  };

  return (
    <FieldRow label={label} hint={inert ? t("This block's current design doesn't display this image.") : undefined}>
      <div className="vbe-image-row">
        {value ? (
          <img src={value} alt="" className="vbe-image-preview" />
        ) : (
          <span className="vbe-image-preview vbe-image-preview--empty">—</span>
        )}
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={t('Image URL')} />
        <label className="btn btn--sm btn--secondary vbe-upload-btn">
          <UploadSimple size={14} weight="bold" />
          {t('Upload')}
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>
    </FieldRow>
  );
}

function EnumField({ label, value, options, optionLabels = {}, onChange, hint }) {
  const { t } = useLang();
  return (
    <FieldRow label={label} hint={hint}>
      <select value={value ?? options[0]} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => <option key={opt} value={opt}>{opt === '' ? t('(none)') : t(optionLabels[opt] || opt)}</option>)}
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
  const { t } = useLang();
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
            <button type="button" className="icon-btn icon-btn--danger" onClick={() => remove(i)} title={t('Remove')}>
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--sm btn--secondary vbe-add-btn" onClick={add}>
        <Plus size={14} weight="bold" /> {t('Add')}
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
  const { t } = useLang();
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
              <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} title={t('Move up')}>
                <CaretUp size={14} weight="bold" />
              </button>
              <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} title={t('Move down')}>
                <CaretDown size={14} weight="bold" />
              </button>
              <button type="button" className="icon-btn icon-btn--danger" onClick={() => remove(i)} title={t('Remove item')}>
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
        <Plus size={14} weight="bold" /> {t('Add item')}
      </button>
    </FieldRow>
  );
}

// Renders a single field, dispatching to the right input type based on the
// field's key name and current value's JS type.
function FieldGenerator({ blockType, parentKey = '', fieldKey, value, onChange }) {
  const { t } = useLang();
  const label = t(humanizeKey(fieldKey));
  const hint = t(FIELD_HINTS[fieldKey]);

  if (isImageKey(fieldKey)) {
    const inert = INERT_IMAGE_FIELDS.has(`${blockType}.${fieldKey}`) || INERT_IMAGE_FIELDS.has(`${parentKey}.${fieldKey}`);
    return <ImageField label={label} value={value} onChange={onChange} inert={inert} />;
  }

  const enumOptions = enumOptionsFor(blockType, parentKey, fieldKey);
  if (enumOptions) {
    return (
      <EnumField
        label={label}
        value={value}
        options={enumOptions}
        optionLabels={optionLabelsFor(blockType, parentKey, fieldKey)}
        onChange={onChange}
        hint={hint}
      />
    );
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
  const { t } = useLang();
  const source = value.source || 'manual';
  const conditionalKey = PRODUCT_GRID_SOURCE_FIELD[source];
  const conditionalValue = value[conditionalKey] ?? (conditionalKey === 'productIds' ? [] : '');

  return (
    <>
      <FieldGenerator blockType="productGrid" fieldKey="title" value={value.title || ''} onChange={(v) => onChange({ ...value, title: v })} />
      <EnumField
        label={t('Source')}
        value={source}
        options={ENUM_OPTIONS.source}
        onChange={(v) => onChange({ ...value, source: v })}
        hint={t('How this grid picks its products.')}
      />
      <FieldGenerator blockType="productGrid" fieldKey={conditionalKey} value={conditionalValue} onChange={(v) => onChange({ ...value, [conditionalKey]: v })} />
      <FieldGenerator blockType="productGrid" fieldKey="limit" value={value.limit ?? 4} onChange={(v) => onChange({ ...value, limit: v })} />
    </>
  );
}

// Shop "Products" block: just the section heading + subheading shown
// above the grid. Everything else (empty-state message, carousel
// behavior/timing, accessibility label overrides) is intentionally not
// exposed here (industry-standard product admins don't surface that
// level of control); the props/schema still accept them if ever set
// directly, this just keeps the everyday editor short.
function ShopProductGridFields({ value, onChange }) {
  const { t } = useLang();
  const setField = (key, v) => onChange({ ...value, [key]: v });
  const field = (key, fallback) => (
    <FieldGenerator blockType="shopProductGrid" fieldKey={key} value={value[key] ?? fallback} onChange={(v) => setField(key, v)} />
  );

  return (
    <>
      {field('heading', '')}
      {field('subheading', '')}
    </>
  );
}

// About page blocks: a fixed, ordered, plainly-labelled form per block -
// the same short-editor idea as ShopProductGridFields, rather than the
// generic editor's "one input per stored prop". Every field shows even
// when the block hasn't stored it yet (so e.g. a button can be added to a
// section that never had one), and fields a variant doesn't render are
// left out. Layout-only props (variant on page-specific blocks) aren't
// shown but are preserved on save; the Code tab still exposes everything.
const PARAGRAPHS_HINT = 'Leave a blank line between paragraphs.';
const BUTTON_FIELDS = [
  { key: 'ctaLabel', label: 'Button text', hint: 'Leave empty to hide the button.' },
  { key: 'ctaLink', label: 'Button link', hint: FIELD_HINTS.ctaLink },
];

const CURATED_FIELDS = {
  // pageHero is shared by many pages; only the About variant is curated
  pageHero: (p) => p.variant === 'about-maker' && [
    { key: 'eyebrow', label: 'Small label', hint: 'Short text shown above the heading.' },
    { key: 'heading', label: 'Heading', type: 'textarea' },
  ],
  aboutFeature: () => [
    { key: 'eyebrowText', label: 'Small label', hint: 'Short text shown above the heading.' },
    { key: 'eyebrowIcon', label: 'Label icon', type: 'select' },
    { key: 'heading', label: 'Heading' },
    { key: 'body', label: 'Text', type: 'textarea', hint: PARAGRAPHS_HINT },
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'imageAlt', label: 'Image description', hint: FIELD_HINTS.imageAlt },
    { key: 'reverse', label: 'Image on the left', type: 'toggle' },
    ...BUTTON_FIELDS,
  ],
  aboutStory: (p) => [
    { key: 'variant', label: 'Style', type: 'select', fallback: 'plain' },
    ...(p.variant === 'vision' ? [{ key: 'eyebrow', label: 'Small label', hint: 'Short text shown above the heading.' }] : []),
    { key: 'heading', label: 'Heading' },
    { key: 'body', label: 'Text', type: 'textarea', hint: PARAGRAPHS_HINT },
    ...(p.variant === 'vision' ? [] : BUTTON_FIELDS),
  ],
  iconCards: () => [
    { key: 'items', label: 'Cards', type: 'list' },
  ],
  aboutContact: () => [
    { key: 'heading', label: 'Heading' },
    { key: 'address', label: 'Address' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
  ],
  ctaRow: () => [
    { key: 'heading', label: 'Heading', hint: 'Optional.' },
    { key: 'body', label: 'Text', type: 'textarea', hint: 'Optional.' },
    { key: 'buttons', label: 'Buttons', type: 'list' },
  ],
};

function CuratedFields({ blockType, fields, value, onChange }) {
  const { t } = useLang();
  const setField = (key, v) => onChange({ ...value, [key]: v });

  return fields.map(({ key, label, hint, type = 'text', fallback }) => {
    const fieldValue = value[key] ?? fallback;
    const common = { label: t(label), hint: hint && t(hint) };
    const onFieldChange = (v) => setField(key, v);

    switch (type) {
      case 'image':
        return <ImageField key={key} {...common} value={fieldValue} onChange={onFieldChange} />;
      case 'toggle':
        return <BooleanField key={key} {...common} value={fieldValue} onChange={onFieldChange} />;
      case 'select':
        return (
          <EnumField
            key={key}
            {...common}
            value={fieldValue}
            options={enumOptionsFor(blockType, '', key)}
            optionLabels={optionLabelsFor(blockType, '', key)}
            onChange={onFieldChange}
          />
        );
      case 'list':
        return <ArrayOfObjectsField key={key} blockType={blockType} fieldKey={key} label={common.label} items={fieldValue || []} onChange={onFieldChange} />;
      case 'textarea': {
        const rows = Math.max(3, Math.min(10, Math.ceil((fieldValue || '').length / 70)));
        return (
          <FieldRow key={key} {...common}>
            <textarea rows={rows} value={fieldValue || ''} onChange={(e) => onFieldChange(e.target.value)} />
          </FieldRow>
        );
      }
      default:
        return (
          <FieldRow key={key} {...common}>
            <input value={fieldValue ?? ''} onChange={(e) => onFieldChange(e.target.value)} />
          </FieldRow>
        );
    }
  });
}

function VisualBlockEditor({ blockType, value, onChange }) {
  const { t } = useLang();
  const setField = (key, v) => onChange({ ...value, [key]: v });

  const curated = CURATED_FIELDS[blockType]?.(value || {});
  if (curated) {
    return <CuratedFields blockType={blockType} fields={curated} value={value || {}} onChange={onChange} />;
  }

  if (blockType === 'productGrid') {
    return <ProductGridFields value={value} onChange={onChange} />;
  }

  if (blockType === 'shopProductGrid') {
    return <ShopProductGridFields value={value || {}} onChange={onChange} />;
  }

  // Underscore-prefixed keys (e.g. _migrationId) are internal bookkeeping:
  // hidden from the form but preserved on save since setField spreads the
  // full value. They remain inspectable in the Code tab. `value` can be
  // undefined for a block with no props (Mongoose omits an empty Mixed
  // field on save rather than persisting `{}`).
  const keys = Object.keys(value || {}).filter((k) => !k.startsWith('_'));
  if (keys.length === 0) {
    return <p className="vbe-empty">{t('This block has no editable fields.')}</p>;
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
