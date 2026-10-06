import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { submitWebform } from '../../services/api/drupalWebformApi';
import './QuotePage.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1717386255773-1e3037c81788?w=1920&h=600&fit=crop&auto=format';
const WEBFORM_ID = 'request_a_quote';

const SECTORS = [
  'Oil & Gas',
  'Petrochemical',
  'Infrastructure & Water',
  'Commercial & MEP',
  'Industrial / Manufacturing',
  'Power Generation',
  'Other',
];

const CATEGORIES = [
  'Pipes & Fittings',
  'Flanges & Gaskets',
  'Valves & Flow Control',
  'Flexible Connections',
  'Instrumentation & Measurement',
  'Fasteners',
  'Other',
];

const EMPTY_FORM = {
  full_name: '',
  company_name: '',
  email: '',
  phone: '',
  country: '',
  industry_sector: '',
  product_category: '',
  estimated_quantity: '',
  technical_specifications: '',
  additional_notes: '',
};

const STEPS = [
  { number: '01', title: 'We review your inquiry', text: 'Within a few hours of submission' },
  { number: '02', title: 'Technical consultation', text: 'Our team may reach out for clarification' },
  { number: '03', title: 'Quotation delivered', text: 'Detailed offer within 24 hours' },
];

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function QuotePage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  return (
    <div className="quote-page" dir="ltr">
      <section className="quote-page__hero">
        <img src={HERO_IMAGE} alt="" />
        <div className="quote-page__hero-shade" />
        <div className="blueprint-grid" />
        <div className="quote-page__hero-copy">
          <div className="quote-page__eyebrow">
            <span />
            <span>GET STARTED</span>
            <span />
          </div>
          <h1>Request a <span>Quote</span></h1>
          <p>
            Fill in the form below and our engineering team will prepare a tailored quotation within 24 hours.
          </p>
        </div>
      </section>

      <div className="quote-page__body">
        <div className="quote-page__layout">
          <form className="quote-page__form" onSubmit={handleSubmit}>
            <div className="quote-page__block">
              <h2><span />Contact Information</h2>
              <div className="quote-page__grid">
                <div>
                  <label htmlFor="quote-full_name">Full Name *</label>
                  <input
                    id="quote-full_name"
                    name="full_name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={form.full_name}
                    onChange={(event) => updateField('full_name', event.target.value)}
                  />
                  {fieldErrors.full_name && <p className="quote-page__error">{fieldErrors.full_name}</p>}
                </div>
                <div>
                  <label htmlFor="quote-company_name">Company Name *</label>
                  <input
                    id="quote-company_name"
                    name="company_name"
                    type="text"
                    required
                    placeholder="Company Name"
                    value={form.company_name}
                    onChange={(event) => updateField('company_name', event.target.value)}
                  />
                  {fieldErrors.company_name && <p className="quote-page__error">{fieldErrors.company_name}</p>}
                </div>
                <div>
                  <label htmlFor="quote-email">Email Address *</label>
                  <input
                    id="quote-email"
                    name="email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                  {fieldErrors.email && <p className="quote-page__error">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor="quote-phone">Phone Number</label>
                  <input
                    id="quote-phone"
                    name="phone"
                    type="tel"
                    placeholder="+962 79 123 4567"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                  />
                  {fieldErrors.phone && <p className="quote-page__error">{fieldErrors.phone}</p>}
                </div>
                <div className="is-wide">
                  <label htmlFor="quote-country">Country</label>
                  <input
                    id="quote-country"
                    name="country"
                    type="text"
                    placeholder="Jordan"
                    value={form.country}
                    onChange={(event) => updateField('country', event.target.value)}
                  />
                  {fieldErrors.country && <p className="quote-page__error">{fieldErrors.country}</p>}
                </div>
              </div>
            </div>

            <div className="quote-page__block">
              <h2><span />Product Details</h2>
              <div className="quote-page__grid">
                <div>
                  <label htmlFor="quote-industry_sector">Industry Sector</label>
                  <select
                    id="quote-industry_sector"
                    name="industry_sector"
                    value={form.industry_sector}
                    onChange={(event) => updateField('industry_sector', event.target.value)}
                  >
                    <option value="">Select sector...</option>
                    {SECTORS.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                  {fieldErrors.industry_sector && <p className="quote-page__error">{fieldErrors.industry_sector}</p>}
                </div>
                <div>
                  <label htmlFor="quote-product_category">Product Category</label>
                  <select
                    id="quote-product_category"
                    name="product_category"
                    value={form.product_category}
                    onChange={(event) => updateField('product_category', event.target.value)}
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {fieldErrors.product_category && <p className="quote-page__error">{fieldErrors.product_category}</p>}
                </div>
                <div className="is-wide">
                  <label htmlFor="quote-estimated_quantity">Estimated Quantity / UoM</label>
                  <input
                    id="quote-estimated_quantity"
                    name="estimated_quantity"
                    type="text"
                    placeholder="e.g. 500 meters, 50 pcs, 1 lot…"
                    value={form.estimated_quantity}
                    onChange={(event) => updateField('estimated_quantity', event.target.value)}
                  />
                  {fieldErrors.estimated_quantity && <p className="quote-page__error">{fieldErrors.estimated_quantity}</p>}
                </div>
                <div className="is-wide">
                  <label htmlFor="quote-technical_specifications">Technical Specifications</label>
                  <textarea
                    id="quote-technical_specifications"
                    name="technical_specifications"
                    rows="4"
                    placeholder="Size, grade, standard, pressure class, material, coating, end connections, etc."
                    value={form.technical_specifications}
                    onChange={(event) => updateField('technical_specifications', event.target.value)}
                  />
                  {fieldErrors.technical_specifications && <p className="quote-page__error">{fieldErrors.technical_specifications}</p>}
                </div>
                <div className="is-wide">
                  <label htmlFor="quote-additional_notes">Additional Notes</label>
                  <textarea
                    id="quote-additional_notes"
                    name="additional_notes"
                    rows="3"
                    placeholder="Delivery timeline, project name, special requirements..."
                    value={form.additional_notes}
                    onChange={(event) => updateField('additional_notes', event.target.value)}
                  />
                  {fieldErrors.additional_notes && <p className="quote-page__error">{fieldErrors.additional_notes}</p>}
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Submit Inquiry'}
              <ArrowIcon />
            </button>
          </form>

          <aside className="quote-page__aside">
            <div className="quote-page__call">
              <div className="blueprint-grid" />
              <div className="quote-page__call-inner">
                <h3>Prefer to call?</h3>
                <div className="quote-page__call-row">
                  <span>📞</span>
                  <div>
                    <div>TELEFAX</div>
                    <p>+962 6 5561362 / 66</p>
                  </div>
                </div>
                <div className="quote-page__call-row">
                  <span>✉️</span>
                  <div>
                    <div>EMAIL</div>
                    <p>ibrahim@omraniajo.com</p>
                  </div>
                </div>
                <div className="quote-page__call-row">
                  <span>📍</span>
                  <div>
                    <div>LOCATION</div>
                    <p>Khalda, Amman, Jordan</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="quote-page__next">
              <h4>What happens next?</h4>
              {STEPS.map((step) => (
                <div className="quote-page__step" key={step.number}>
                  <span>{step.number}</span>
                  <div>
                    <div>{step.title}</div>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default QuotePage;
