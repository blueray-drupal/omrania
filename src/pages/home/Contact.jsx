import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { submitWebform } from '../../services/api/drupalWebformApi';
import { useGetInTouch } from '../contact/useGetInTouch';
import './Contact.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1604157886233-08985afc49e9?w=1920&h=600&fit=crop&auto=format';
const WEBFORM_ID = 'contact_us';

const EMPTY_FORM = {
  full_name: '',
  company_name: '',
  email: '',
  phone: '',
  product_service: '',
  message: '',
};

function lineContent(line) {
  if (/^https?:\/\//i.test(line) || /^www\./i.test(line)) {
    const href = /^www\./i.test(line) ? `http://${line}` : line;
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {line.replace(/^https?:\/\//i, '')}
      </a>
    );
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line)) {
    return <a href={`mailto:${line}`}>{line}</a>;
  }

  return line;
}

function InfoCard({ card }) {
  return (
    <div className="contact__info">
      <span className="contact__info-icon">
        {card.image && <img src={card.image} alt="" />}
      </span>
      <div>
        {card.label && <div className="contact__info-label">{card.label}</div>}
        <div className="contact__info-value">
          {card.lines.map((line) => (
            <span key={line}>{lineContent(line)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Contact({ page = false }) {
  const contact = useGetInTouch();
  const [inView, setInView] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const sectionRef = useRef(null);
  const heading = contact.title || 'Get in Touch With Us';
  const fieldId = (key) => `${page ? 'contact-page' : 'contact'}-${key}`;

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((current) => ({ ...current, [key]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    try {
      await submitWebform(WEBFORM_ID, form);
      setForm(EMPTY_FORM);
      await Swal.fire({
        icon: 'success',
        title: 'Submitted successfully',
        text: 'Thank you. We will be in touch soon.',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      setFieldErrors(error.fieldErrors || {});
      Swal.fire({
        icon: 'error',
        title: 'Submission failed',
        text: error.message || 'An error occurred. Please try again.',
        confirmButtonText: 'OK',
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setInView(true);
      observer.disconnect();
    }, { threshold: 0.15 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className={`contact${page ? ' contact-page' : ''}${inView ? ' is-visible' : ''}`}
      dir="ltr"
    >
      <div className="contact__hero">
        <img src={HERO_IMAGE} alt="" />
        <div className="contact__hero-shade" />
        <div className="blueprint-grid" />
        <div className="contact__hero-copy">
          <div className="contact__hero-eyebrow">
            <span />
            <span>CONTACT AL OMRANIA</span>
            <span />
          </div>
          {page ? <h1>{heading}</h1> : <h2>{heading}</h2>}
          <p>
            We are here to answer your technical questions, provide specification support, and help with your next project.
          </p>
        </div>
      </div>

      <div className="contact__body">
        <div className="contact__layout">
          <div className="contact__reveal">
            <h3>Head Office Information</h3>
            <p className="contact__company">
              <strong>AL OMRANIA FOR MECHANICAL & ENGINEERING SUPPLIES CO. LTD.</strong>
            </p>
            {contact.cards.map((card) => (
              <InfoCard key={card.id} card={card} />
            ))}
          </div>

          <div className="contact__reveal" style={{ '--reveal-delay': '0.1s' }}>
            <div className="contact__form-card">
              <h3>Send us a message</h3>
              <form className="contact__form" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor={fieldId('full_name')}>Full Name</label>
                  <input
                    id={fieldId('full_name')}
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={(event) => updateField('full_name', event.target.value)}
                  />
                  {fieldErrors.full_name && <p className="contact__field-error">{fieldErrors.full_name}</p>}
                </div>
                <div>
                  <label htmlFor={fieldId('company_name')}>Company Name</label>
                  <input
                    id={fieldId('company_name')}
                    type="text"
                    name="company_name"
                    value={form.company_name}
                    onChange={(event) => updateField('company_name', event.target.value)}
                  />
                  {fieldErrors.company_name && <p className="contact__field-error">{fieldErrors.company_name}</p>}
                </div>
                <div>
                  <label htmlFor={fieldId('email')}>Email Address</label>
                  <input
                    id={fieldId('email')}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                  {fieldErrors.email && <p className="contact__field-error">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor={fieldId('phone')}>Phone Number</label>
                  <input
                    id={fieldId('phone')}
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                  />
                  {fieldErrors.phone && <p className="contact__field-error">{fieldErrors.phone}</p>}
                </div>
                <div className="is-wide">
                  <label htmlFor={fieldId('product_service')}>Product / Service</label>
                  <input
                    id={fieldId('product_service')}
                    type="text"
                    name="product_service"
                    value={form.product_service}
                    onChange={(event) => updateField('product_service', event.target.value)}
                  />
                  {fieldErrors.product_service && <p className="contact__field-error">{fieldErrors.product_service}</p>}
                </div>
                <div className="is-wide">
                  <label htmlFor={fieldId('message')}>Message</label>
                  <textarea
                    id={fieldId('message')}
                    name="message"
                    rows="4"
                    value={form.message}
                    onChange={(event) => updateField('message', event.target.value)}
                  />
                  {fieldErrors.message && <p className="contact__field-error">{fieldErrors.message}</p>}
                </div>
                <div className="is-wide contact__submit">
                  <button type="submit" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Send Message'} <span>→</span>
                  </button>
                </div>
              </form>
            </div>
            {contact.mapSrc && (
              <div className="contact__map">
                <iframe
                  src={contact.mapSrc}
                  title="Location Map"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
