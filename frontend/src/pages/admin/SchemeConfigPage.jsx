import React, { useEffect, useState } from 'react';
import { fetchSchemes, updateScheme, createScheme } from '../../services/api';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Toast from '../../components/shared/Toast';

export default function SchemeConfigPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isEditing, setIsEditing] = useState(false);
  const [currentScheme, setCurrentScheme] = useState(null);
  const [isNewScheme, setIsNewScheme] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formState, setFormState] = useState({
    schemeCode: '',
    schemeName: '',
    description: '',
    selectionMethod: 'merit',
    selectionMethodDescription: '',
    degreeLevels: 'M.Phil, PhD',
    minMarks: '55',
    incomeCeiling: '',
    benefitDisplay: '',
    benefitRates: '{"M.Phil": 25000, "PhD": 28000}',
    requiredDocuments: [
      { id: 'casteCertificate', label: 'Caste Certificate', required: true, helpText: '' },
      { id: 'marksheet', label: 'Marksheet / Degree', required: true, helpText: '' }
    ],
    quotaRules: [
      { category: 'General ST', reservedSeats: 750, totalSeats: 750, notes: '' }
    ]
  });

  const loadSchemes = async () => {
    try {
      setLoading(true);
      const data = await fetchSchemes();
      setSchemes(data);
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to load scheme configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const openEditModal = (scheme) => {
    setIsNewScheme(false);
    setCurrentScheme(scheme);
    setFormState({
      schemeCode: scheme.schemeCode,
      schemeName: scheme.schemeName,
      description: scheme.description || '',
      selectionMethod: scheme.selectionMethod || 'merit',
      selectionMethodDescription: scheme.selectionMethodDescription || '',
      degreeLevels: (scheme.eligibility?.degreeLevels || []).join(', '),
      minMarks: scheme.eligibility?.minMarks !== null && scheme.eligibility?.minMarks !== undefined ? String(scheme.eligibility.minMarks) : '',
      incomeCeiling: scheme.eligibility?.incomeCeiling ? String(scheme.eligibility.incomeCeiling) : '',
      benefitDisplay: scheme.benefitAmount?.display || '',
      benefitRates: JSON.stringify(scheme.benefitAmount?.rates || {}, null, 2),
      requiredDocuments: scheme.requiredDocuments ? [...scheme.requiredDocuments] : [],
      quotaRules: scheme.quotaRules ? [...scheme.quotaRules] : []
    });
    setIsEditing(true);
  };

  const openNewModal = () => {
    setIsNewScheme(true);
    setCurrentScheme(null);
    setFormState({
      schemeCode: '',
      schemeName: '',
      description: '',
      selectionMethod: 'merit',
      selectionMethodDescription: '',
      degreeLevels: 'Masters, PhD',
      minMarks: '55',
      incomeCeiling: '',
      benefitDisplay: '₹25,000/month stipend',
      benefitRates: '{\n  "Masters": 25000,\n  "PhD": 28000\n}',
      requiredDocuments: [
        { id: 'casteCertificate', label: 'ST Caste Certificate', required: true, helpText: 'Competent authority certificate' },
        { id: 'marksheet', label: 'Degree Marksheet', required: true, helpText: 'Qualifying transcript' }
      ],
      quotaRules: [
        { category: 'Scheduled Tribe', reservedSeats: 100, totalSeats: 100, notes: 'General quota' }
      ]
    });
    setIsEditing(true);
  };

  const handleDocumentChange = (index, field, value) => {
    const updated = [...formState.requiredDocuments];
    updated[index] = { ...updated[index], [field]: value };
    setFormState((prev) => ({ ...prev, requiredDocuments: updated }));
  };

  const addDocumentField = () => {
    setFormState((prev) => ({
      ...prev,
      requiredDocuments: [
        ...prev.requiredDocuments,
        { id: `doc_${Date.now()}`, label: 'New Document Proof', required: true, helpText: '' }
      ]
    }));
  };

  const removeDocumentField = (index) => {
    setFormState((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== index)
    }));
  };

  const handleQuotaChange = (index, field, value) => {
    const updated = [...formState.quotaRules];
    updated[index] = {
      ...updated[index],
      [field]: field === 'reservedSeats' || field === 'totalSeats' ? parseInt(value || '0', 10) : value
    };
    setFormState((prev) => ({ ...prev, quotaRules: updated }));
  };

  const addQuotaRule = () => {
    setFormState((prev) => ({
      ...prev,
      quotaRules: [
        ...prev.quotaRules,
        { category: 'Category', reservedSeats: 10, totalSeats: 20, notes: '' }
      ]
    }));
  };

  const removeQuotaRule = (index) => {
    setFormState((prev) => ({
      ...prev,
      quotaRules: prev.quotaRules.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let parsedRates = {};
      try {
        parsedRates = JSON.parse(formState.benefitRates || '{}');
      } catch (err) {
        throw new Error('Benefit rates must be valid JSON format, e.g. {"PhD": 28000}');
      }

      const degreeList = formState.degreeLevels
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        schemeCode: formState.schemeCode.trim().toUpperCase(),
        schemeName: formState.schemeName.trim(),
        description: formState.description.trim(),
        selectionMethod: formState.selectionMethod,
        selectionMethodDescription: formState.selectionMethodDescription.trim(),
        eligibility: {
          degreeLevels: degreeList,
          minMarks: formState.minMarks ? parseFloat(formState.minMarks) : null,
          incomeCeiling: formState.incomeCeiling ? parseFloat(formState.incomeCeiling) : null,
          category: 'ST',
          specialPreferences: ['PVTG', 'Divyangan']
        },
        requiredDocuments: formState.requiredDocuments,
        quotaRules: formState.quotaRules,
        benefitAmount: {
          type: formState.incomeCeiling ? 'annual_scholarship' : 'monthly_fellowship',
          currency: 'INR',
          rates: parsedRates,
          display: formState.benefitDisplay
        }
      };

      if (isNewScheme) {
        await createScheme(payload);
        setToastType('success');
        setToastMessage(`Scheme ${payload.schemeCode} created successfully.`);
      } else {
        await updateScheme(currentScheme.schemeCode, payload);
        setToastType('success');
        setToastMessage(`Scheme ${payload.schemeCode} updated successfully.`);
      }

      setIsEditing(false);
      await loadSchemes();
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to save scheme configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="scheme-tag">Phase 2 Scheme Config Engine</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Live Data Store: backend/src/data/schemes.json
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Scheme Rules & Configuration Engine
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
            Manage configurable rules, selection pipelines, document checklists, and quota allocations across MoTA schemes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" onClick={loadSchemes}>
            ↻ Refresh Schemes
          </Button>
          <Button variant="primary" size="sm" onClick={openNewModal}>
            + Add New Scheme
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-primary)' }}>
          Loading scheme configurations...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {schemes.map((scheme) => {
            const isMerit = scheme.selectionMethod === 'merit';
            const incomeCeilingText = scheme.eligibility?.incomeCeiling
              ? `₹${scheme.eligibility.incomeCeiling.toLocaleString('en-IN')}/year ceiling`
              : 'No Income Limit (Universal ST)';

            return (
              <Card key={scheme.schemeCode}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <span className="scheme-tag" style={{ fontSize: '0.85rem' }}>
                        Scheme Code: {scheme.schemeCode}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: isMerit ? 'var(--color-success-bg)' : '#E0F2FE',
                          color: isMerit ? 'var(--color-success)' : '#0369A1'
                        }}
                      >
                        {isMerit ? '⚡ Merit-Based Selection' : '🎙️ Interview-Based Selection'}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      {scheme.schemeName}
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem', maxWidth: '750px' }}>
                      {scheme.description}
                    </p>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => openEditModal(scheme)}>
                    ✏️ Configure Scheme
                  </Button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    padding: '1rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      Eligible Degree Levels
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
                      {(scheme.eligibility?.degreeLevels || []).join(', ')}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      Income Ceiling Rule
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
                      {incomeCeilingText}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      Min Qualifying Marks
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>
                      {scheme.eligibility?.minMarks ? `${scheme.eligibility.minMarks}%` : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      Entitled Benefit Amount
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-success)', marginTop: '0.2rem' }}>
                      {scheme.benefitAmount?.display || 'Configured via rates'}
                    </div>
                  </div>
                </div>

                {/* Quota Rules & Required Documents Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {/* Quota Seats */}
                  <div
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                      📊 Seat Quota Allocations ({scheme.quotaRules?.length || 0} Categories)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {(scheme.quotaRules || []).map((q, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: '0.82rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            backgroundColor: '#F8FAFC',
                            padding: '0.35rem 0.65rem',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <span><strong>{q.category}</strong>: {q.notes || ''}</span>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                            {q.reservedSeats} / {q.totalSeats} seats
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Documents */}
                  <div
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                      📄 Required Document Checklist ({scheme.requiredDocuments?.length || 0} Documents)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {(scheme.requiredDocuments || []).map((doc, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: '0.82rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            backgroundColor: '#F8FAFC',
                            padding: '0.35rem 0.65rem',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <span>{doc.label}</span>
                          <span style={{ color: doc.required ? 'var(--color-error)' : 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {doc.required ? 'Mandatory' : 'Optional'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                {isNewScheme ? 'Create New Scholarship Scheme' : `Configure Scheme: ${formState.schemeCode}`}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Scheme Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formState.schemeCode}
                      onChange={(e) => setFormState({ ...formState, schemeCode: e.target.value })}
                      disabled={!isNewScheme}
                      placeholder="e.g. ARG45"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Selection Pipeline Method</label>
                    <select
                      className="form-select"
                      value={formState.selectionMethod}
                      onChange={(e) => setFormState({ ...formState, selectionMethod: e.target.value })}
                    >
                      <option value="merit">Merit-based (Academic Marks Ranking)</option>
                      <option value="interview">Interview-based (Screening + Interview Committee)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Scheme Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formState.schemeName}
                    onChange={(e) => setFormState({ ...formState, schemeName: e.target.value })}
                    placeholder="e.g. National Overseas Scholarship for ST Candidates (NOS)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Scope</label>
                  <textarea
                    rows="2"
                    className="form-input"
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Degree Levels (Comma separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formState.degreeLevels}
                      onChange={(e) => setFormState({ ...formState, degreeLevels: e.target.value })}
                      placeholder="e.g. M.Phil, PhD or Masters, PhD, Post-Doc"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Income Ceiling (₹/year, blank for none)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formState.incomeCeiling}
                      onChange={(e) => setFormState({ ...formState, incomeCeiling: e.target.value })}
                      placeholder="e.g. 600000 or leave empty for NFST"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Minimum Qualifying Marks (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      step="0.5"
                      value={formState.minMarks}
                      onChange={(e) => setFormState({ ...formState, minMarks: e.target.value })}
                      placeholder="e.g. 55"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Benefit Amount Label</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formState.benefitDisplay}
                      onChange={(e) => setFormState({ ...formState, benefitDisplay: e.target.value })}
                      placeholder="e.g. ₹25,000/mo (M.Phil) or ₹28,000/mo (PhD)"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Benefit Rates by Course (JSON Map)</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    value={formState.benefitRates}
                    onChange={(e) => setFormState({ ...formState, benefitRates: e.target.value })}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Dynamic Required Documents Section */}
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Required Document Rules
                    </label>
                    <button
                      type="button"
                      onClick={addDocumentField}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      + Add Document Proof
                    </button>
                  </div>

                  {formState.requiredDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr 100px 40px',
                        gap: '0.5rem',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <input
                        type="text"
                        className="form-input"
                        placeholder="doc_id"
                        value={doc.id}
                        onChange={(e) => handleDocumentChange(idx, 'id', e.target.value)}
                        required
                        style={{ fontSize: '0.85rem' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Document Label"
                        value={doc.label}
                        onChange={(e) => handleDocumentChange(idx, 'label', e.target.value)}
                        required
                        style={{ fontSize: '0.85rem' }}
                      />
                      <select
                        className="form-select"
                        value={doc.required ? 'true' : 'false'}
                        onChange={(e) => handleDocumentChange(idx, 'required', e.target.value === 'true')}
                        style={{ fontSize: '0.85rem' }}
                      >
                        <option value="true">Mandatory</option>
                        <option value="false">Optional</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeDocumentField(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-error)',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '1.1rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quota Rules Section */}
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Quota Seat Distribution Rules
                    </label>
                    <button
                      type="button"
                      onClick={addQuotaRule}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      + Add Quota Category
                    </button>
                  </div>

                  {formState.quotaRules.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 90px 90px 40px',
                        gap: '0.5rem',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Category (e.g. PVTG)"
                        value={q.category}
                        onChange={(e) => handleQuotaChange(idx, 'category', e.target.value)}
                        required
                        style={{ fontSize: '0.85rem' }}
                      />
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Reserved"
                        value={q.reservedSeats}
                        onChange={(e) => handleQuotaChange(idx, 'reservedSeats', e.target.value)}
                        required
                        style={{ fontSize: '0.85rem' }}
                      />
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Total"
                        value={q.totalSeats}
                        onChange={(e) => handleQuotaChange(idx, 'totalSeats', e.target.value)}
                        required
                        style={{ fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeQuotaRule(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-error)',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '1.1rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Saving Scheme...' : 'Save Configuration'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
