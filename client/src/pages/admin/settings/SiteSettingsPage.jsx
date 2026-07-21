import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../../api/settings.api';
import toast from 'react-hot-toast';
import { useLang } from '../../../i18n/LanguageContext.jsx';

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
