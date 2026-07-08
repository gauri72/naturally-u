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
      <h1>Site Settings</h1>
      <label>Site Name</label>
      <input
        value={settings.siteName}
        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
      />
      <br /><br />
      <label>Footer Copyright Text</label>
      <input
        value={settings.footer?.copyrightText || ''}
        onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, copyrightText: e.target.value } })}
      />
      <br /><br />
      <button className="btn btn--primary" onClick={handleSave}>Save Settings</button>
    </div>
  );
}

export default SiteSettingsPage;
