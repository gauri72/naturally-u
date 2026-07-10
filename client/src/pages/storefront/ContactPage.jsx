import { useState } from 'react';
import { EnvelopeSimple, Phone, MapPin } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { submitContactMessage } from '../../api/contact.api';
import './ContactPage.css';

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactMessage(form);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="contact-page">
      <div className="contact-page__hero">
        <h1>Contact Us</h1>
        <p>Questions about a product, a workshop, or an order? We'd love to hear from you.</p>
      </div>

      <div className="contact-page__layout">
        <div className="contact-page__info">
          <div className="contact-page__info-card">
            <EnvelopeSimple size={24} weight="regular" />
            <div>
              <h3>Email</h3>
              <a href="mailto:hello@naturallyu.com">hello@naturallyu.com</a>
            </div>
          </div>
          <div className="contact-page__info-card">
            <Phone size={24} weight="regular" />
            <div>
              <h3>Phone</h3>
              <a href="tel:+15551234567">+1 555 123-4567</a>
            </div>
          </div>
          <div className="contact-page__info-card">
            <MapPin size={24} weight="regular" />
            <div>
              <h3>Location</h3>
              <p>Den Haag, Netherlands</p>
            </div>
          </div>
        </div>

        <form className="contact-page__form" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Message
            <textarea name="message" rows={5} value={form.message} onChange={handleChange} required />
          </label>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ContactPage;
