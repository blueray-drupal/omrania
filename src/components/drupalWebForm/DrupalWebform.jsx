/**
 * DrupalWebform.jsx
 *
 * A fully dynamic, reusable React component that renders and submits
 * any Drupal webform — no hardcoded fields, no project-specific logic.
 *
 * Requires:
 *   - webform_rest Drupal module
 *   - ./drupalWebformApi  (fetchWebformElements, submitWebform, submitWebformWithFile)
 *   - ./DrupalWebform.css
 *   - sweetalert2  (npm install sweetalert2)
 *
 * Supported field types:
 *   textfield, email, tel, url, number, date, datetime,
 *   textarea, select, radios, checkboxes, file, hidden
 *
 * Basic usage:
 *   <DrupalWebform webformId="contact_us" />
 *
 * Advanced usage:
 *   <DrupalWebform
 *     webformId="partnership_application"
 *     submitLabel="Apply Now"
 *     fieldOrder={['name', 'email', 'message']}
 *     fieldRows={[['first_name', 'last_name'], ['email', 'phone']]}
 *     excludeFields={['internal_ref']}
 *     extraData={{ source: 'homepage' }}
 *     submitKeyMap={{ mail: 'email' }}
 *     messages={{ successTitle: 'Done!', successText: 'We will be in touch.' }}
 *     onSuccess={(response) => navigate('/thank-you')}
 *     onError={(err) => console.error(err)}
 *   />
 */

import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { fetchWebformElements, submitWebform, submitWebformWithFile } from '../../services/api/drupalWebformApi';
import { buildFieldList } from '../../utils/webformSchema';
import './DrupalWebform.css';

// ─── Initial Values ───────────────────────────────────────────────────────────

const getInitialValue = (type, defaultValue) => {
  if (type === 'file') return null;
  if (type === 'checkboxes') {
    if (Array.isArray(defaultValue)) return defaultValue.filter(Boolean).map(String);
    if (defaultValue && typeof defaultValue === 'object') {
      return Object.entries(defaultValue).filter(([, v]) => Boolean(v)).map(([k]) => String(k));
    }
    return [];
  }
  if (defaultValue !== undefined && defaultValue !== null) return String(defaultValue);
  return '';
};

const getInitialFormData = (fields) =>
  Object.fromEntries(fields.map(({ key, type, defaultValue }) => [key, getInitialValue(type, defaultValue)]));

// ─── Field Ordering & Layout ──────────────────────────────────────────────────

const resolveFieldSpecifier = (specifier, fields) => {
  if (typeof specifier === 'string') return specifier;
  if (Array.isArray(specifier)) {
    return specifier.find((candidate) => fields.some((field) => field.key === candidate)) ?? null;
  }
  return null;
};

const applyFieldOrder = (fields, fieldOrder) => {
  if (!fieldOrder?.length) return fields;
  const resolvedOrder = fieldOrder
    .map((specifier) => resolveFieldSpecifier(specifier, fields))
    .filter(Boolean);
  const indexMap = new Map(resolvedOrder.map((key, i) => [key, i]));
  return [...fields].sort((a, b) => {
    const ia = indexMap.get(a.key) ?? Number.MAX_SAFE_INTEGER;
    const ib = indexMap.get(b.key) ?? Number.MAX_SAFE_INTEGER;
    if (ia !== ib) return ia - ib;
    return a.weight - b.weight;
  });
};

const buildChunks = (fields, fieldRows) => {
  if (!fieldRows?.length) return fields.map((field) => ({ kind: 'field', field }));

  const pairSet = new Set(
    fieldRows
      .map(([a, b]) => [resolveFieldSpecifier(a, fields), resolveFieldSpecifier(b, fields)])
      .filter(([a, b]) => a && b)
      .map(([a, b]) => `${a}|${b}`)
  );
  const chunks = [];
  let i = 0;
  while (i < fields.length) {
    const current = fields[i];
    const next    = fields[i + 1];
    if (next && pairSet.has(`${current.key}|${next.key}`)) {
      chunks.push({ kind: 'row', fields: [current, next] });
      i += 2;
    } else {
      chunks.push({ kind: 'field', field: current });
      i += 1;
    }
  }
  return chunks;
};

// ─── Submission Payload Builder ───────────────────────────────────────────────

const buildPayload = (fields, formData, submitKeyMap = {}) => {
  const out = {};

  for (const { key, type, required } of fields) {
    if (type === 'file') continue;
    if (type === 'hidden') {
      out[submitKeyMap[key] ?? key] = formData[key] ?? '';
      continue;
    }

    const outKey = submitKeyMap[key] ?? key;
    const val    = formData[key] ?? formData[outKey];

    if (type === 'checkboxes') {
      const arr = Array.isArray(val) ? val.filter(Boolean) : [];
      if (arr.length === 0 && !required) continue;
      out[outKey] = arr;
      continue;
    }

    if (type === 'select') {
      const s = (val ?? '').toString().trim();
      if (s === '' || s === '_none_') continue;
      out[outKey] = s;
      continue;
    }

    if (val === undefined || val === null) continue;

    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed === '' && !required) continue;
      if (type === 'url' && trimmed === '') continue;
      out[outKey] = val;
      continue;
    }

    out[outKey] = val;
  }

  return out;
};

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = (fields, formData, excludeSet, messages) => {
  const errors = {};

  for (const { key, type, title, required, requiredError } of fields) {
    if (excludeSet?.has(key)) continue;
    if (type === 'hidden') continue;

    const customMsg = requiredError || null;
    const reqMsg    = customMsg ?? messages.fieldRequired(title);

    if (type === 'file') {
      if (required && !(formData[key] instanceof File)) errors[key] = reqMsg;
      continue;
    }

    if (type === 'checkboxes') {
      const arr = formData[key];
      if (required && !(Array.isArray(arr) && arr.length > 0)) errors[key] = reqMsg;
      continue;
    }

    const raw   = formData[key] ?? '';
    const value = typeof raw === 'string' ? raw.trim() : String(raw).trim();

    if (required && !value) { errors[key] = reqMsg; continue; }

    if (type === 'email' && value && !EMAIL_RE.test(value)) {
      errors[key] = customMsg ?? messages.invalidEmail;
      continue;
    }

    if (type === 'url' && value) {
      try { new URL(value); } catch {
        errors[key] = customMsg ?? messages.invalidUrl;
      }
    }
  }

  return errors;
};

// ─── Default Messages ─────────────────────────────────────────────────────────

const DEFAULT_MESSAGES = {
  loading:       'Loading form…',
  loadError:     'Failed to load the form. Please try again.',
  empty:         'This form has no fields.',
  successTitle:  'Submitted successfully',
  successText:   'Thank you. We will be in touch soon.',
  errorTitle:    'Submission failed',
  errorGeneric:  'An error occurred. Please try again.',
  submitting:    'Submitting…',
  submitLabel:   'Submit',
  ok:            'OK',
  fieldRequired: (title) => `${title} is required`,
  invalidEmail:  'Please enter a valid email address',
  invalidUrl:    'Please enter a valid URL',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * DrupalWebform
 *
 * @param {string}   webformId       - Drupal webform machine name (required)
 * @param {string}   [submitLabel]   - Submit button text
 * @param {string[]} [fieldOrder]    - Explicit display order of field keys
 * @param {Array[]}  [fieldRows]     - Pairs to render side-by-side: [['a','b'],['c','d']]
 * @param {string[]} [excludeFields] - Field keys to hide
 * @param {object}   [submitKeyMap]  - { reactKey: drupalKey } — rename keys in POST body
 * @param {object}   [extraData]     - Extra key/value pairs merged into every submission
 * @param {object}   [messages]      - Override any default UI strings
 * @param {string}   [className]     - Additional class on the <form> element
 * @param {object}   [fieldOverrides]- Partial field metadata overrides by field key
 * @param {React.ReactNode} [submitIcon] - Optional icon rendered inside submit button
 * @param {object}   [swalProps]     - Extra SweetAlert2 options merged into every Swal.fire() call
 * @param {Function} [onSuccess]     - Called with Drupal response after success
 * @param {Function} [onError]       - Called with Error object on submission failure
 */
const DrupalWebform = ({
  webformId,
  submitLabel,
  fieldOrder,
  fieldRows,
  excludeFields,
  submitKeyMap,
  extraData,
  messages: messagesProp,
  className,
  style,
  fieldOverrides,
  submitIcon,
  swalProps,
  onSuccess,
  onError,
}) => {
  const messages = useMemo(
    () => ({ ...DEFAULT_MESSAGES, ...messagesProp }),
    [messagesProp]
  );

  const [fields,     setFields]     = useState([]);
  const [formData,   setFormData]   = useState({});
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const excludeSet = useMemo(
    () => (excludeFields?.length ? new Set(excludeFields) : null),
    [excludeFields]
  );

  // ── Load schema ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        // ✅ No baseUrl — axios.config.js owns the base URL
        const raw  = await fetchWebformElements(webformId);
        const list = buildFieldList(raw);

        if (!cancelled) {
          setFields(list);
          setFormData(getInitialFormData(list));
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err.message || messages.loadError;
          setLoadError(msg);
          Swal.fire({ icon: 'error', title: messages.errorTitle, text: msg, confirmButtonText: messages.ok, ...swalProps });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [webformId]);

  // ── Derived display list ──────────────────────────────────────────────────
  const displayFields = useMemo(() => {
    let visible = fields.filter((f) => f.type !== 'hidden');
    if (excludeSet) visible = visible.filter((f) => !excludeSet.has(f.key));
    visible = visible.map((field) => ({
      ...field,
      ...(fieldOverrides?.[field.key] ?? {}),
    }));
    return applyFieldOrder(visible, fieldOrder);
  }, [fields, fieldOrder, excludeSet, fieldOverrides]);

  const chunks = useMemo(
    () => buildChunks(displayFields, fieldRows),
    [displayFields, fieldRows]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleCheckbox = (key, optionValue, checked) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[key]) ? [...prev[key]] : [];
      if (checked) { if (!current.includes(optionValue)) current.push(optionValue); }
      else { const idx = current.indexOf(optionValue); if (idx >= 0) current.splice(idx, 1); }
      return { ...prev, [key]: current };
    });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(fields, formData, excludeSet, messages);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      document.getElementById(Object.keys(validationErrors)[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        ...buildPayload(fields, formData, submitKeyMap),
        ...(extraData ?? {}),
      };

      const fileData = {};
      for (const { key, type } of fields) {
        if (type === 'file' && formData[key] instanceof File) fileData[key] = formData[key];
      }

      let response;
      if (Object.keys(fileData).length > 0) {
        // ✅ No baseUrl
        response = await submitWebformWithFile(webformId, payload, fileData);
      } else {
        // ✅ No baseUrl
        response = await submitWebform(webformId, payload);
      }

      setFormData(getInitialFormData(fields));
      setErrors({});

      await Swal.fire({
        icon: 'success',
        title: messages.successTitle,
        text: messages.successText,
        confirmButtonText: messages.ok,
        ...swalProps,
      });

      onSuccess?.(response);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: messages.errorTitle,
        text: err.message || messages.errorGeneric,
        confirmButtonText: messages.ok,
        ...swalProps,
      });
      onError?.(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderField = (field) => {
    if (field.type === 'hidden') return null;
    const hasError = Boolean(errors[field.key]);
    const fieldId  = field.key;

    return (
      <div key={field.key} className="dwf-field">
        {field.type !== 'checkboxes' && field.type !== 'radios' && (
          <label className="dwf-label" htmlFor={fieldId}>
            {field.title}
            {field.required && <span className="dwf-required" aria-hidden="true"> *</span>}
          </label>
        )}

        {field.description && (
          <span id={`${fieldId}-desc`} className="dwf-description">{field.description}</span>
        )}

        {field.type === 'textarea' ? (
          <textarea
            id={fieldId}
            className={`dwf-textarea${hasError ? ' dwf-textarea--error' : ''}`}
            placeholder={field.placeholder || undefined}
            value={formData[field.key] ?? ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            aria-invalid={hasError}
            aria-required={field.required}
            aria-describedby={field.description ? `${fieldId}-desc` : undefined}
          />
        ) : field.type === 'select' ? (
          <select
            id={fieldId}
            className={`dwf-select${hasError ? ' dwf-select--error' : ''}`}
            value={formData[field.key] ?? ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            aria-invalid={hasError}
            aria-required={field.required}
          >
            <option value="">— {field.placeholder || 'Select'} —</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : field.type === 'radios' ? (
          <fieldset className="dwf-fieldset" aria-required={field.required}>
            <legend className="dwf-legend">
              {field.title}
              {field.required && <span className="dwf-required" aria-hidden="true"> *</span>}
            </legend>
            <div className="dwf-radios">
              {field.options.map((opt) => (
                <label key={opt.value} className="dwf-radio-label">
                  <input type="radio" className="dwf-radio" name={field.key} value={opt.value}
                    checked={(formData[field.key] ?? '') === opt.value}
                    onChange={() => handleChange(field.key, opt.value)} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : field.type === 'checkboxes' ? (
          <fieldset className="dwf-fieldset" aria-required={field.required}>
            <legend className="dwf-legend">
              {field.title}
              {field.required && <span className="dwf-required" aria-hidden="true"> *</span>}
            </legend>
            <div className="dwf-checkboxes">
              {field.options.map((opt) => (
                <label key={opt.value} className="dwf-checkbox-label">
                  <input type="checkbox" className="dwf-checkbox"
                    checked={Array.isArray(formData[field.key]) && formData[field.key].includes(opt.value)}
                    onChange={(e) => handleCheckbox(field.key, opt.value, e.target.checked)} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : field.type === 'file' ? (
          <label className="dwf-file-label" htmlFor={fieldId}>
            <input id={fieldId} type="file" className="dwf-file-input"
              accept={field.fileAccept || undefined}
              onChange={(e) => handleChange(field.key, e.target.files?.[0] ?? null)}
              aria-invalid={hasError} aria-required={field.required} />
            <span className="dwf-file-text">
              {formData[field.key] instanceof File ? formData[field.key].name : field.placeholder || 'Click to upload or drag a file here'}
            </span>
            {field.fileAccept && <span className="dwf-file-hint">Accepted: {field.fileAccept}</span>}
          </label>
        ) : (
          <input
            id={fieldId}
            type={
              field.type === 'email'    ? 'email'    :
              field.type === 'tel'     ? 'tel'      :
              field.type === 'url'     ? 'url'      :
              field.type === 'number'  ? 'number'   :
              field.type === 'date'    ? 'date'     :
              field.type === 'datetime'? 'datetime-local' : 'text'
            }
            className={`dwf-input${hasError ? ' dwf-input--error' : ''}`}
            placeholder={field.placeholder || undefined}
            value={formData[field.key] ?? ''}
            step={field.type === 'number' ? 'any' : undefined}
            onChange={(e) => handleChange(field.key, e.target.value)}
            aria-invalid={hasError}
            aria-required={field.required}
            aria-describedby={field.description ? `${fieldId}-desc` : undefined}
          />
        )}

        {hasError && (
          <span role="alert" className="dwf-error">{errors[field.key]}</span>
        )}
      </div>
    );
  };

  const renderChunk = (chunk) => {
    if (chunk.kind === 'row') {
      return (
        <div key={`row-${chunk.fields[0].key}-${chunk.fields[1].key}`} className="dwf-row">
          {chunk.fields.map(renderField)}
        </div>
      );
    }
    return <React.Fragment key={chunk.field.key}>{renderField(chunk.field)}</React.Fragment>;
  };

  // ── State renders ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dwf dwf--loading" role="status" aria-live="polite">
        <span className="dwf-spinner" aria-hidden="true" />
        <span>{messages.loading}</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="dwf dwf--error" role="alert">
        <p className="dwf-message dwf-message--error">{loadError}</p>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="dwf dwf--empty">
        <p className="dwf-message">{messages.empty}</p>
      </div>
    );
  }

  return (
    <form
      className={['dwf', className].filter(Boolean).join(' ')}
      style={style}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="dwf-fields">
        {chunks.map(renderChunk)}
      </div>
      <div className="dwf-actions">
        <button type="submit" className="dwf-btn" disabled={submitting} aria-busy={submitting}>
          {submitIcon ? <span className="dwf-btn-icon" aria-hidden="true">{submitIcon}</span> : null}
          {submitting ? messages.submitting : (submitLabel ?? messages.submitLabel)}
        </button>
      </div>
    </form>
  );
};

export default DrupalWebform;
