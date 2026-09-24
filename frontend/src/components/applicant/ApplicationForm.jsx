import React, { useState, useEffect } from 'react';
import DocumentUpload from './DocumentUpload';
import Button from '../shared/Button';
import { fetchSchemes } from '../../services/api';

export default function ApplicationForm({ onSubmit, isSubmitting = false }) {
  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [selectedSchemeCode, setSelectedSchemeCode] = useState('ARG45');

  const [formData, setFormData] = useState({
    name: 'Mangal Soren',
    dob: '1998-05-14',
    category: 'ST', // ST-exclusive scheme
    specialCategory: 'None',
    specialCategoryDetails: '',
    course: 'PhD',
    institution: 'Jawaharlal Nehru University, New Delhi',
    marksPercentage: '78.5',
    annualIncome: '',
    documents: {
      casteCertificate: 'st_caste_cert_msoren.pdf',
      marksheet: 'pg_marksheet_msoren.pdf'
    }
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    async function load() {
      try {
        setLoadingSchemes(true);
        const data = await fetchSchemes();
        setSchemes(data);
        if (data && data.length > 0) {
          const defaultScheme = data.find((s) => s.schemeCode === 'ARG45') || data[0];
          setSelectedSchemeCode(defaultScheme.schemeCode);
          if (defaultScheme.eligibility?.degreeLevels?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              course: defaultScheme.eligibility.degreeLevels[0]
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load schemes:', err);
      } finally {
        setLoadingSchemes(false);
      }
    }
    load();
  }, []);

  const selectedScheme = schemes.find((s) => s.schemeCode === selectedSchemeCode) || null;

  // Handle scheme change
  const handleSchemeChange = (newCode) => {
    setSelectedSchemeCode(newCode);
    const targetScheme = schemes.find((s) => s.schemeCode === newCode);
    if (targetScheme) {
      const defaultCourse = targetScheme.eligibility?.degreeLevels?.[0] || 'PhD';
      // Prepopulate sample documents for quick demo
      const initialDocs = {};
      (targetScheme.requiredDocuments || []).forEach((doc) => {
        initialDocs[doc.id] = `${doc.id}_sample.pdf`;
      });

      setFormData((prev) => ({
        ...prev,
        course: defaultCourse,
        annualIncome: targetScheme.eligibility?.incomeCeiling ? '450000' : '',
        documents: initialDocs
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDocumentChange = (docId, fileName) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docId]: fileName
      }
    }));
    if (formErrors[docId]) {
      setFormErrors((prev) => ({ ...prev, [docId]: null }));
    }
  };

  // Compute fellowship / benefit amount dynamically from scheme config
  const computeBenefit = () => {
    if (!selectedScheme || !selectedScheme.benefitAmount) {
      return { amount: 28000, label: '₹28,000 / month' };
    }
    const rates = selectedScheme.benefitAmount.rates || {};
    const rate = rates[formData.course];
    if (rate !== undefined) {
      if (selectedScheme.benefitAmount.type === 'annual_scholarship') {
        return { amount: rate, label: `₹${rate.toLocaleString('en-IN')} / year (Full Allowance)` };
      }
      return { amount: rate, label: `₹${rate.toLocaleString('en-IN')} / month` };
    }
    return {
      amount: selectedScheme.schemeCode === 'AZKMI' ? 1500000 : 28000,
      label: selectedScheme.benefitAmount.display || 'Per Scheme Scale'
    };
  };

  const benefitInfo = computeBenefit();

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.dob) errors.dob = 'Date of birth is required.';
    if (!formData.institution.trim()) errors.institution = 'Institution is required.';

    const marks = parseFloat(formData.marksPercentage);
    const minMarksRequired = selectedScheme?.eligibility?.minMarks || 50;
    if (!formData.marksPercentage || isNaN(marks)) {
      errors.marksPercentage = 'Valid marks percentage is required.';
    } else if (marks < minMarksRequired || marks > 100) {
      errors.marksPercentage = `Marks percentage must be between ${minMarksRequired}% and 100% for ${selectedScheme?.schemeCode || 'scheme'} eligibility.`;
    }

    // Income ceiling check if applicable
    if (selectedScheme?.eligibility?.incomeCeiling) {
      const income = parseFloat(formData.annualIncome);
      if (!formData.annualIncome || isNaN(income)) {
        errors.annualIncome = 'Annual family income is mandatory for this scheme.';
      } else if (income > selectedScheme.eligibility.incomeCeiling) {
        errors.annualIncome = `Family income exceeds statutory ceiling of ₹${selectedScheme.eligibility.incomeCeiling.toLocaleString('en-IN')}/year.`;
      }
    }

    // Dynamic document validation based on scheme's requiredDocuments
    if (selectedScheme && selectedScheme.requiredDocuments) {
      selectedScheme.requiredDocuments.forEach((doc) => {
        if (doc.required && (!formData.documents || !formData.documents[doc.id])) {
          errors[doc.id] = `${doc.label} is required.`;
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name,
      dob: formData.dob,
      category: 'ST',
      specialCategory: formData.specialCategory,
      specialCategoryDetails: formData.specialCategoryDetails,
      schemeCode: selectedScheme?.schemeCode || 'ARG45',
      schemeName: selectedScheme?.schemeName || 'NFST Fellowship',
      course: formData.course,
      fellowshipAmount: benefitInfo.amount,
      institution: formData.institution,
      marksPercentage: parseFloat(formData.marksPercentage),
      annualIncome: selectedScheme?.eligibility?.incomeCeiling ? parseFloat(formData.annualIncome) : null,
      documents: formData.documents
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* 1. Dynamic Scheme Selector */}
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '2px solid var(--color-primary)',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <label htmlFor="schemeSelect" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)', display: 'block' }}>
              🎯 Select MoTA Scholarship / Fellowship Scheme
            </label>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
              Scheme rules, eligibility criteria, and required documents adapt dynamically.
            </span>
          </div>

          {selectedScheme && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: selectedScheme.selectionMethod === 'merit' ? 'var(--color-success-bg)' : '#E0F2FE',
                color: selectedScheme.selectionMethod === 'merit' ? 'var(--color-success)' : '#0369A1'
              }}
            >
              {selectedScheme.selectionMethod === 'merit' ? '⚡ Merit-Based Selection' : '🎙️ Interview-Based Selection'}
            </span>
          )}
        </div>

        <select
          id="schemeSelect"
          className="form-select"
          value={selectedSchemeCode}
          onChange={(e) => handleSchemeChange(e.target.value)}
          disabled={loadingSchemes}
          style={{ fontWeight: 600, fontSize: '1rem', padding: '0.75rem' }}
        >
          {schemes.map((s) => (
            <option key={s.schemeCode} value={s.schemeCode}>
              [{s.schemeCode}] {s.schemeName}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Scheme Information & Benefit Rates Banner */}
      {selectedScheme && (
        <div
          style={{
            backgroundColor: '#EEF4FC',
            border: '1px solid #C7D9F1',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ maxWidth: '650px' }}>
            <span className="scheme-tag" style={{ marginBottom: '0.25rem' }}>
              Scheme Code: {selectedScheme.schemeCode}
            </span>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', fontWeight: 700 }}>
              {selectedScheme.schemeName}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              {selectedScheme.description}
            </p>
          </div>

          <div
            style={{
              textAlign: 'right',
              backgroundColor: '#FFFFFF',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #D5E3F5'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Statutory Benefit Rate
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-success)' }}>
              {benefitInfo.label}
            </div>
          </div>
        </div>
      )}

      {/* 3. Personal & Demographic Details */}
      <div className="form-grid-2">
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full Name (As per 10th / Degree Certificate) <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="e.g. Mangal Soren"
            required
          />
          {formErrors.name && (
            <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {formErrors.name}
            </div>
          )}
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label htmlFor="dob" className="form-label">
            Date of Birth <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className="form-input"
            required
          />
          {formErrors.dob && (
            <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {formErrors.dob}
            </div>
          )}
        </div>
      </div>

      <div className="form-grid-2">
        {/* Social Category (ST Exclusive) */}
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Social Category <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value="ST (Scheduled Tribe - Exclusive)"
            disabled
            className="form-input"
          />
          <div className="form-help">Schemes are exclusively formulated for Scheduled Tribe (ST) candidates.</div>
        </div>

        {/* Special Category / Quota Preference */}
        <div className="form-group">
          <label htmlFor="specialCategory" className="form-label">
            Special Priority Category (Affirmative Preference)
          </label>
          <select
            id="specialCategory"
            name="specialCategory"
            value={formData.specialCategory}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="None">None (General ST Candidate)</option>
            <option value="PVTG">PVTG (Particularly Vulnerable Tribal Group - Statutory Priority)</option>
            <option value="Divyangan">Divyangan (Person with Benchmark Disability ≥ 40%)</option>
          </select>
          <div className="form-help">PVTG and Divyangan candidates receive affirmative preference under scheme quota rules.</div>
        </div>
      </div>

      {formData.specialCategory !== 'None' && (
        <div className="form-group">
          <label htmlFor="specialCategoryDetails" className="form-label">
            {formData.specialCategory === 'PVTG' ? 'Community / Tribal Name' : 'Disability & UDID Details'}
          </label>
          <input
            type="text"
            id="specialCategoryDetails"
            name="specialCategoryDetails"
            value={formData.specialCategoryDetails}
            onChange={handleInputChange}
            className="form-input"
            placeholder={
              formData.specialCategory === 'PVTG'
                ? 'e.g. Birhor, Baiga, Chenchu, Toda...'
                : 'e.g. Locomotor Disability 45%, UDID: DL0510...'
            }
          />
        </div>
      )}

      {/* 4. Academic & Degree Details (Dynamic Degree levels from Scheme) */}
      <div className="form-grid-2">
        <div className="form-group">
          <label htmlFor="course" className="form-label">
            Target Research / Study Degree <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <select
            id="course"
            name="course"
            value={formData.course}
            onChange={handleInputChange}
            className="form-select"
          >
            {(selectedScheme?.eligibility?.degreeLevels || ['PhD']).map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl} {selectedScheme?.benefitAmount?.rates?.[lvl] ? `(₹${selectedScheme.benefitAmount.rates[lvl].toLocaleString('en-IN')})` : ''}
              </option>
            ))}
          </select>
          <div className="form-help">Populated dynamically from {selectedScheme?.schemeCode || 'Scheme'} config.</div>
        </div>

        {/* Postgraduate / Qualifying Degree Marks */}
        <div className="form-group">
          <label htmlFor="marksPercentage" className="form-label">
            Qualifying Degree Marks (%) <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <input
            type="number"
            step="0.1"
            min={selectedScheme?.eligibility?.minMarks || 50}
            max="100"
            id="marksPercentage"
            name="marksPercentage"
            value={formData.marksPercentage}
            onChange={handleInputChange}
            className="form-input"
            placeholder="e.g. 78.5"
            required
          />
          {formErrors.marksPercentage && (
            <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {formErrors.marksPercentage}
            </div>
          )}
          <div className="form-help">
            Minimum required for {selectedScheme?.schemeCode || 'Scheme'}: {selectedScheme?.eligibility?.minMarks || 55}% marks.
          </div>
        </div>
      </div>

      {/* Institution Name */}
      <div className="form-group">
        <label htmlFor="institution" className="form-label">
          {selectedSchemeCode === 'AZKMI'
            ? 'Admitted Foreign University / Overseas Institution'
            : 'Enrolled / Admitted UGC-Recognized Institution'}{' '}
          <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <input
          type="text"
          id="institution"
          name="institution"
          value={formData.institution}
          onChange={handleInputChange}
          className="form-input"
          placeholder={
            selectedSchemeCode === 'AZKMI'
              ? 'e.g. University of Oxford, UK or Harvard University, USA'
              : 'e.g. Jawaharlal Nehru University, University of Hyderabad, NEHU...'
          }
          required
        />
        {formErrors.institution && (
          <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {formErrors.institution}
          </div>
        )}
      </div>

      {/* 5. Conditional Income Ceiling Field (Only for Schemes with incomeCeiling !== null, e.g. NOS) */}
      {selectedScheme?.eligibility?.incomeCeiling !== null && selectedScheme?.eligibility?.incomeCeiling !== undefined && (
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="annualIncome" className="form-label" style={{ color: '#92400E' }}>
              Total Family Annual Income (₹) <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="number"
              id="annualIncome"
              name="annualIncome"
              value={formData.annualIncome}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. 450000"
              required
            />
            {formErrors.annualIncome && (
              <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {formErrors.annualIncome}
              </div>
            )}
            <div className="form-help" style={{ color: '#B45309' }}>
              Statutory requirement for Scheme {selectedScheme.schemeCode}: Total annual family income must not exceed ₹
              {selectedScheme.eligibility.incomeCeiling.toLocaleString('en-IN')}/year.
            </div>
          </div>
        </div>
      )}

      {/* 6. Dynamic Document Uploads based on scheme.requiredDocuments */}
      <div style={{ margin: '1.75rem 0', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
          Document Uploads ({selectedScheme?.requiredDocuments?.length || 2} proofs required)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          Upload scanned verification proofs configured specifically for <strong>{selectedScheme?.schemeName}</strong>.
        </p>

        <div className="form-grid-2">
          {(selectedScheme?.requiredDocuments || []).map((doc) => (
            <div key={doc.id}>
              <DocumentUpload
                id={doc.id}
                label={doc.label}
                fileName={formData.documents?.[doc.id]}
                onChange={(fname) => handleDocumentChange(doc.id, fname)}
                required={doc.required}
                helpText={doc.helpText}
              />
              {formErrors[doc.id] && (
                <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                  {formErrors[doc.id]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <Button type="submit" variant="primary" disabled={isSubmitting} style={{ minWidth: '200px' }}>
          {isSubmitting ? 'Submitting Application...' : `Submit ${selectedScheme?.schemeCode || ''} Application`}
        </Button>
      </div>
    </form>
  );
}
