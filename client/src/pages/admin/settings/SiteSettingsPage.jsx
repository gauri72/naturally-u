import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../../api/settings.api';
import toast from 'react-hot-toast';

function SiteSettingsPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => { getSettings().then((res) => setSettings(res.data)); }, []);

  const handleSave = async () => {
    try {
      await updateSettings(settings);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  if (!settings) return <p>Loading…</p>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Site Settings</h1>
      </div>
      <div className="admin-form">
        <div className="admin-field">
          <label>Site Name</label>
          <input
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
          />
        </div>
        <div className="admin-field">
          <label>Footer Copyright Text</label>
          <input
            value={settings.footer?.copyrightText || ''}
            onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, copyrightText: e.target.value } })}
          />
        </div>
        <button className="btn btn--primary" onClick={handleSave} style={{ alignSelf: 'flex-start' }}>Save Settings</button>
      </div>
    </div>
  );
}

export default SiteSettingsPage;
