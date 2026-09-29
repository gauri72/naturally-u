import { useEffect, useState } from 'react';
import { Plus, Trash, CaretUp, CaretDown } from '@phosphor-icons/react';
import { getSettings, updateSettings } from '../../../api/settings.api';
import toast from 'react-hot-toast';
import { useLang } from '../../../i18n/LanguageContext.jsx';
import './SiteSettingsPage.css';

// Repeatable {label, path} row editor for settings.navLinks (the Header's
// nav - see client/src/components/common/Header.jsx). Same shape/idea as
// Footer's shopLinks/customerCareLinks, but those have no admin UI yet;
// this is the first list editor in Site Settings, kept local to this file
// since it's the only place that needs it today.
function NavLinksEditor({ links, onChange }) {
  const { t } = useLang();
  const update = (i, key, value) => {
    const next = [...links];
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };
  const remove = (i) => onChange(links.filter((_, idx) => idx !== i));
  const add = () => onChange([...links, { label: '', path: '' }]);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const next = [...links];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="nav-links-editor">
      {links.map((link, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="nav-links-editor__row">
          <input
            value={link.label}
            placeholder={t('Label')}
            onChange={(e) => update(i, 'label', e.target.value)}
          />
          <input
            value={link.path}
            placeholder={t('Path, e.g. /shop')}
            onChange={(e) => update(i, 'path', e.target.value)}
          />
          <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} title={t('Move up')}>
            <CaretUp size={14} weight="bold" />
          </button>
          <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === links.length - 1} title={t('Move down')}>
            <CaretDown size={14} weight="bold" />
          </button>
          <button type="button" className="icon-btn icon-btn--danger" onClick={() => remove(i)} title={t('Remove')}>
            <Trash size={16} />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn--sm btn--secondary nav-links-editor__add" onClick={add}>
        <Plus size={14} weight="bold" /> {t('Add Link')}
      </button>
    </div>
  );
}

function SiteSettingsPage() {
  const { t } = useLang();
  const [settings, setSettings] = useState(null);

  useEffect(() => { getSettings().then((res) => setSettings(res.data)); }, []);

  const handleSave = async () => {
    try {
      await updateSettings(settings);
      toast.success(t('Settings saved'));
    } catch {
      toast.error(t('Failed to save settings'));
    }
  };

  if (!settings) return <p>{t('Loading…')}</p>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>{t('Site Settings')}</h1>
      </div>
      <div className="admin-form">
        <div className="admin-field">
          <label>{t('Site Name')}</label>
          <input
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
          />
        </div>
        <div className="admin-field">
          <label>{t('Header Navigation')}</label>
          <NavLinksEditor
            links={settings.navLinks || []}
            onChange={(navLinks) => setSettings({ ...settings, navLinks })}
          />
        </div>
        <div className="admin-field">
          <label>{t('Footer Copyright Text')}</label>
          <input
            value={settings.footer?.copyrightText || ''}
            onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, copyrightText: e.target.value } })}
          />
        </div>
        <button className="btn btn--primary" onClick={handleSave} style={{ alignSelf: 'flex-start' }}>{t('Save Settings')}</button>
      </div>
    </div>
  );
}

export default SiteSettingsPage;
