import React, { useEffect, useState } from 'react';
import Button from './Button';
import { fetchSanctionLetter } from '../../services/api';

export default function SanctionLetterModal({ applicationId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [letterData, setLetterData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!applicationId) return;
    const loadLetter = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchSanctionLetter(applicationId);
        setLetterData(data);
      } catch (err) {
        setError(err.message || 'Unable to load sanction letter.');
      } finally {
        setLoading(false);
      }
    };
    loadLetter();
  }, [applicationId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.3rem' }}>📜</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                Ministry of Tribal Affairs — Formal Award Sanction Letter
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Ref ID: {applicationId} • Official Digital Document
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {letterData && (
              <Button variant="secondary" size="sm" onClick={handlePrint}>
                🖨️ Print / Save PDF
              </Button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '1.5rem',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '0 0.5rem'
              }}
              title="Close Modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body / Document Container */}
        <div style={{ padding: '2rem', overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-primary)' }}>
              Retrieving verified sanction record from MoTA Registry...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-error)' }}>
              <p style={{ fontWeight: 700 }}>Unable to generate sanction letter</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.35rem' }}>{error}</p>
            </div>
          ) : letterData ? (
            <div
              className="printable-sanction-letter"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #CBD5E1',
                borderRadius: '8px',
                padding: '2.5rem 3rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                color: '#1E293B',
                fontFamily: 'Georgia, serif',
                lineHeight: 1.6,
                position: 'relative'
              }}
            >
              {/* National Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0F172A', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#475569' }}>
                  GOVERNMENT OF INDIA
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                  MINISTRY OF TRIBAL AFFAIRS
                </div>
                <div style={{ fontSize: '0.88rem', color: '#334155', fontStyle: 'italic' }}>
                  (Scholarship & Fellowship Administration Division)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>
                  Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi – 110001
                </div>
              </div>

              {/* Award Metadata Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1.5rem', fontFamily: 'sans-serif' }}>
                <div>
                  <strong>Sanction Order No:</strong> <code>{letterData.awardNumber}</code>
                </div>
                <div>
                  <strong>Date of Issue:</strong> {letterData.issueDate}
                </div>
              </div>

              {/* Subject */}
              <div style={{ backgroundColor: '#F1F5F9', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.92rem', fontFamily: 'sans-serif' }}>
                <strong>SUBJECT:</strong> Provisional Sanction of Fellowship Award under <strong>{letterData.schemeName} ({letterData.schemeCode})</strong> for Scheduled Tribe Scholars.
              </div>

              {/* Formal Text */}
              <div style={{ fontSize: '0.95rem', marginBottom: '1.25rem', textAlign: 'justify' }}>
                The President of India, acting through the Ministry of Tribal Affairs, is pleased to convey official sanction for the award of fellowship/scholarship under <strong>{letterData.schemeName}</strong> to the candidate specified below, subject to adherence to all statutory guidelines and verification of original credentials:
              </div>

              {/* Awardee Details Table */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.88rem',
                  fontFamily: 'sans-serif',
                  marginBottom: '1.5rem'
                }}
              >
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, backgroundColor: '#F8FAFC', width: '35%' }}>Awardee Full Name</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{letterData.applicantName}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, backgroundColor: '#F8FAFC' }}>Date of Birth & Category</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{letterData.applicantDob} • {letterData.category}</td>
                  </tr>
                  {letterData.specialCategory && (
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, backgroundColor: '#F8FAFC' }}>Statutory Priority Quota</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#B45309', fontWeight: 700 }}>
                        ★ {letterData.specialCategory} Earmarked / Priority Category
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, backgroundColor: '#F8FAFC' }}>Enrolled Degree & Subject</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{letterData.course}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, backgroundColor: '#F8FAFC' }}>Institution / University</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{letterData.institution}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, backgroundColor: '#F8FAFC' }}>Fellowship Assistance Rate</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#047857' }}>{letterData.fellowshipRate}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, backgroundColor: '#F8FAFC' }}>Approved Award Tenure</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{letterData.tenure}</td>
                  </tr>
                </tbody>
              </table>

              {/* Conditions */}
              <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '1.75rem', borderLeft: '3px solid #0F172A', paddingLeft: '0.85rem' }}>
                <p>1. Disbursement is subject to direct credit through Direct Benefit Transfer (DBT) to the scholar's Aadhaar-seeded bank account via PFMS.</p>
                <p>2. Continued tenure is contingent upon submission of satisfactory annual academic progress reports countersigned by the Head of Department.</p>
                <p>3. In the event of any misrepresentation or double-claiming across schemes, the fellowship shall be cancelled and disbursed sums recovered.</p>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem', fontFamily: 'sans-serif' }}>
                <div style={{ border: '2px dashed #059669', padding: '0.6rem 0.9rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', letterSpacing: '1px' }}>
                    ✓ DIGITALLY VERIFIED
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#065F46' }}>
                    MoTA Central Fellowship Registry<br />
                    Timestamp: {new Date().toISOString().split('T')[0]}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{letterData.ministryOfficer}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>For and on behalf of the President of India</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Ministry of Tribal Affairs, Government of India</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
