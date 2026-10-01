import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';

// Same address fields as checkout, so a saved address drops straight in.
const ADDRESS_FIELDS = [
  { name: 'line1', label: 'Address', autoComplete: 'address-line1', required: true },
  { name: 'line2', label: 'Apartment, suite, etc. (optional)', autoComplete: 'address-line2' },
  { name: 'postalCode', label: 'Postal Code', autoComplete: 'postal-code', required: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2', required: true },
  { name: 'state', label: 'State / Province', autoComplete: 'address-level1' },
  { name: 'country', label: 'Country', autoComplete: 'country-name', required: true },
];

function AccountProfilePage() {
  const { t } = useLang();
  const { customer, updateProfile } = useCustomer();
  const [form, setForm] = useState(() => ({
    name: customer.name,
    phone: customer.phone || '',
    ...Object.fromEntries(ADDRESS_FIELDS.map((f) => [f.name, customer.address?.[f.name] || ''])),
  }));
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        phone: form.phone,
        address: Object.fromEntries(ADDRESS_FIELDS.map((f) => [f.name, form[f.name]])),
      });
      toast.success(t('Your details have been saved.'));
    } catch (err) {
      toast.error(t(err.response?.data?.message || 'Something went wrong. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="account-title">{t('Profile & address')}</h1>
      <form className="account-panel account-form" onSubmit={handleSubmit}>
        <h2>{t('Contact details')}</h2>
        <div className="account-grid">
          <label className="account-field">
            {t('Full name')}
            <input name="name" value={form.name} onChange={onChange} autoComplete="name" required />
          </label>
          <label className="account-field">
            {t('Phone')}
            <input type="tel" name="phone" value={form.phone} onChange={onChange} autoComplete="tel" />
          </label>
          <label className="account-field account-grid__full">
            {t('Email')}
            <input value={customer.email} disabled />
            <small>{t('Your email is your sign-in and can’t be changed here.')}</small>
          </label>
        </div>

        <h2>{t('Shipping address')}</h2>
        <p className="account-muted">{t('Used to fill in checkout automatically.')}</p>
        <div className="account-grid">
          {ADDRESS_FIELDS.map((f) => (
            <label key={f.name} className={`account-field ${f.name === 'line1' || f.name === 'line2' ? 'account-grid__full' : ''}`}>
              {t(f.label)}
              <input name={f.name} value={form[f.name]} onChange={onChange} autoComplete={f.autoComplete} />
            </label>
          ))}
        </div>

        <button type="submit" className="btn btn--primary account-form__submit account-form__submit--inline" disabled={saving}>
          {saving ? t('Saving…') : t('Save changes')}
        </button>
      </form>
    </>
  );
}

export default AccountProfilePage;
