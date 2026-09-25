import React, { useState } from 'react';
import Button from './Button';

export default function WorkflowVisualizerModal({ onClose, defaultTab = 'lifecycle' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [activeScheme, setActiveScheme] = useState('NOS'); // 'NOS' or 'NFST'

  const LIFECYCLE_STAGES = [
    {
      step: 1,
      title: 'Application Submission',
      badge: 'Applicant Portal',
      statusTag: 'Submitted',
      summary: 'Candidate fills scheme-aware form and attaches academic & caste credentials.',
      actors: '🎓 Scheduled Tribe Scholar',
      inputs: 'Name, DOB, ST Community, Degree, Qualifying Marks, Income Proof, Caste Certificate PDF.',
      automatedAction: 'Calculates statutory fellowship rate dynamically (₹25k M.Phil / ₹28k Ph.D. or ₹15L NOS). Creates immutable audit record.',
      edgeCases: 'Invalid file types, missing required scheme fields.',
      artifact: 'Application Ref ID (e.g. NFST-2026-001) saved in central registry.'
    },
    {
      step: 2,
      title: 'Anti-Fraud & Duplicate Interception',
      badge: 'Automated Shield',
      statusTag: 'Flagged - Possible Duplicate',
      summary: 'Cross-checks submission against national registry to prevent double-claiming across schemes.',
      actors: '🤖 Anti-Fraud Engine',
      inputs: 'Normalized Candidate Name + Date of Birth + State of Origin.',
      automatedAction: 'Executes fuzzy token matching across all historical and active applications.',
      edgeCases: 'Exact or high token overlap marks application as "Flagged - Possible Duplicate" without terminating dossier.',
      artifact: 'Duplicate link recorded with reference ID of original application.'
    },
    {
      step: 3,
      title: 'AI / OCR Document Scrutiny',
      badge: 'AI Engine',
      statusTag: 'Under Review',
      summary: 'Optical Character Recognition reads caste certificate & marksheets to verify eligibility.',
      actors: '🤖 Tesseract OCR & NLP Model',
      inputs: 'Uploaded document images / PDFs.',
      automatedAction: 'Extracts names, dates of birth, issuing authorities, and marks percentages with confidence scores.',
      edgeCases: 'Low OCR confidence (<75%) or mismatch between form and certificate flags discrepancy for officer attention.',
      artifact: 'Detailed AI Verification Dossier with confidence percentages and highlighted checklist.'
    },
    {
      step: 4,
      title: 'Closed-Loop Deficiency Remediation',
      badge: 'Applicant Self-Service',
      statusTag: 'Deficiency Raised',
      summary: 'Isolates flawed documents and alerts applicant without canceling their application.',
      actors: '🏛️ MoTA Scrutiny Officer ⇄ 🎓 Applicant',
      inputs: 'Officer notes + Specific Deficiency Reason.',
      automatedAction: 'Activates orange warning banner on applicant tracking screen and opens in-line Resubmission Desk.',
      edgeCases: 'Applicant uploads corrected proof; dossier returns directly to "Under Review" queue with full audit trail.',
      artifact: 'Corrected document attached; status returned to active review.'
    },
    {
      step: 5,
      title: 'Quota-Aware Merit Selection',
      badge: 'Selection Desk',
      statusTag: 'Selected / Not Selected',
      summary: 'Computes merit ranks while strictly applying statutory reservations for PVTG and Divyangan.',
      actors: '⚖️ Selection Committee',
      inputs: 'Eligible applicant pool, Scheme Quota Rules.',
      automatedAction: 'NOS: Earmarks 3 seats for PVTG candidates; remaining 17 for General ST. NFST: Pure merit with statutory preference flags.',
      edgeCases: 'Committee retains discretionary override authority with mandatory logged justifications.',
      artifact: 'Formal Selection Gazette and provisional list.'
    },
    {
      step: 6,
      title: 'Digital Sanction & DBT Disbursal',
      badge: 'Public Finance',
      statusTag: 'Disbursed → Renewed',
      summary: 'Issues digital award sanction letters and transitions through DBT and annual renewals.',
      actors: '🏛️ Under Secretary (MoTA) & PFMS Gateway',
      inputs: 'Selected candidate list + Admission confirmation.',
      automatedAction: 'Generates official MoTA Award Sanction Letter with unique registration number and tenure clauses.',
      edgeCases: 'Scholar submits annual supervisor progress report; unlocks next year fellowship disbursement.',
      artifact: 'Downloadable PDF Sanction Letter with digital verification seal.'
    }
  ];

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
          borderRadius: '14px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid var(--color-accent)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🗺️</span>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.2px' }}>
                Adivasi Pragati Portal — System Architecture & Workflow Explorer
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Interactive Blueprint for Smart India Hackathon 2026 • Problem ID 26239
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '1.5rem',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0.2rem 0.6rem'
            }}
            title="Close Explorer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            borderBottom: '1px solid #E2E8F0',
            padding: '0.5rem 1.5rem 0',
            gap: '0.5rem',
            overflowX: 'auto'
          }}
        >
          <button
            onClick={() => setActiveTab('lifecycle')}
            style={{
              padding: '0.65rem 1.15rem',
              border: 'none',
              borderBottom: activeTab === 'lifecycle' ? '3px solid var(--color-primary)' : '3px solid transparent',
              backgroundColor: activeTab === 'lifecycle' ? '#FFFFFF' : 'transparent',
              fontWeight: activeTab === 'lifecycle' ? 700 : 500,
              color: activeTab === 'lifecycle' ? 'var(--color-primary)' : '#64748B',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              fontSize: '0.88rem'
            }}
          >
            1. End-to-End Lifecycle
          </button>

          <button
            onClick={() => setActiveTab('deficiency')}
            style={{
              padding: '0.65rem 1.15rem',
              border: 'none',
              borderBottom: activeTab === 'deficiency' ? '3px solid #EA580C' : '3px solid transparent',
              backgroundColor: activeTab === 'deficiency' ? '#FFFFFF' : 'transparent',
              fontWeight: activeTab === 'deficiency' ? 700 : 500,
              color: activeTab === 'deficiency' ? '#EA580C' : '#64748B',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              fontSize: '0.88rem'
            }}
          >
            2. Deficiency Remediation Loop
          </button>

          <button
            onClick={() => setActiveTab('quota')}
            style={{
              padding: '0.65rem 1.15rem',
              border: 'none',
              borderBottom: activeTab === 'quota' ? '3px solid #059669' : '3px solid transparent',
              backgroundColor: activeTab === 'quota' ? '#FFFFFF' : 'transparent',
              fontWeight: activeTab === 'quota' ? 700 : 500,
              color: activeTab === 'quota' ? '#059669' : '#64748B',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              fontSize: '0.88rem'
            }}
          >
            3. Quota Merit Matrix (NFST vs NOS)
          </button>

          <button
            onClick={() => setActiveTab('ai_pipeline')}
            style={{
              padding: '0.65rem 1.15rem',
              border: 'none',
              borderBottom: activeTab === 'ai_pipeline' ? '3px solid #7C3AED' : '3px solid transparent',
              backgroundColor: activeTab === 'ai_pipeline' ? '#FFFFFF' : 'transparent',
              fontWeight: activeTab === 'ai_pipeline' ? 700 : 500,
              color: activeTab === 'ai_pipeline' ? '#7C3AED' : '#64748B',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              fontSize: '0.88rem'
            }}
          >
            4. 10-Stage AI Pipeline
          </button>
        </div>

        {/* Tab Content Container */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1, backgroundColor: '#FAFAFA' }}>
          
          {/* TAB 1: LIFECYCLE */}
          {activeTab === 'lifecycle' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                  Complete 6-Phase Scholarship Lifecycle
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Click each milestone below to inspect actors, automated engine validations, and audit outputs.
                </p>
              </div>

              {/* Horizontal Milestone Tracker */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '0.5rem',
                  marginBottom: '1.5rem'
                }}
              >
                {LIFECYCLE_STAGES.map((stg, idx) => {
                  const isSelected = selectedStageIndex === idx;
                  return (
                    <div
                      key={stg.step}
                      onClick={() => setSelectedStageIndex(idx)}
                      style={{
                        padding: '0.75rem 0.6rem',
                        backgroundColor: isSelected ? 'var(--color-primary)' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#1E293B',
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid #E2E8F0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 6px -1px rgba(26, 77, 143, 0.3)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8 }}>
                        PHASE {stg.step}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: '0.2rem', lineHeight: 1.2 }}>
                        {stg.title}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Stage Deep-Dive Card */}
              {(() => {
                const s = LIFECYCLE_STAGES[selectedStageIndex];
                return (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span
                          style={{
                            backgroundColor: '#E0F2FE',
                            color: '#0369A1',
                            fontWeight: 800,
                            padding: '0.25rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.82rem'
                          }}
                        >
                          PHASE {s.step} OF 6
                        </span>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                          {s.title}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#F1F5F9', borderRadius: '4px', fontWeight: 600 }}>
                          Role: {s.badge}
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#ECFDF5', color: '#047857', borderRadius: '4px', fontWeight: 700 }}>
                          Status: {s.statusTag}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.95rem', color: '#334155', marginBottom: '1.25rem' }}>
                      {s.summary}
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1rem',
                        fontSize: '0.88rem'
                      }}
                    >
                      <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>
                          👤 Key Actors
                        </strong>
                        <span style={{ color: '#475569' }}>{s.actors}</span>
                      </div>

                      <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>
                          📥 Inputs & Required Data
                        </strong>
                        <span style={{ color: '#475569' }}>{s.inputs}</span>
                      </div>

                      <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>
                          ⚙️ Automated Engine Operations
                        </strong>
                        <span style={{ color: '#475569' }}>{s.automatedAction}</span>
                      </div>

                      <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>
                          📄 Resulting Artifact & Audit
                        </strong>
                        <span style={{ color: '#047857', fontWeight: 600 }}>{s.artifact}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 2: DEFICIENCY LOOP */}
          {activeTab === 'deficiency' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#C2410C' }}>
                  Closed-Loop Deficiency Remediation vs Traditional Rejection
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  How the portal prevents premature rejection of deserving tribal scholars.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {/* Traditional Model */}
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>❌</span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#991B1B' }}>
                      Conventional MoTA Process (Delayed Rejection)
                    </h4>
                  </div>
                  <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#7F1D1D', lineHeight: 1.7 }}>
                    <li>Applicant uploads documents during portal window.</li>
                    <li>Files sit in manual review queue for 6–8 weeks.</li>
                    <li>Official notices a blurry scan or DOB mismatch.</li>
                    <li>Application is summarily <strong>REJECTED</strong> without a cure period.</li>
                    <li>Scholar must wait for the next annual cycle (12 months loss).</li>
                  </ol>
                </div>

                {/* Adivasi Pragati Portal Model */}
                <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>✅</span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#065F46' }}>
                      Adivasi Pragati Portal (In-Line Remediation)
                    </h4>
                  </div>
                  <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#064E3B', lineHeight: 1.7 }}>
                    <li>AI OCR detects mismatch immediately (e.g. DOB 1998 vs 1997).</li>
                    <li>Officer clicks <strong>"Raise Deficiency"</strong> with exact field note.</li>
                    <li>Applicant sees dedicated <strong>Orange Action Banner</strong> with exact instructions.</li>
                    <li>Scholar re-uploads only the corrected file via <strong>Resubmission Desk</strong>.</li>
                    <li>Dossier automatically returns to <strong>Under Review</strong> queue with audit record.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUOTA SELECTION MATRIX */}
          {activeTab === 'quota' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>
                    Statutory Quota Merit Allocation Algorithms
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    Dynamic rule handling for National Overseas Scholarship vs NFST Fellowship.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant={activeScheme === 'NOS' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setActiveScheme('NOS')}
                  >
                    Scheme AZKMI (NOS Abroad)
                  </Button>
                  <Button
                    variant={activeScheme === 'NFST' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setActiveScheme('NFST')}
                  >
                    Scheme ARG45 (NFST Domestic)
                  </Button>
                </div>
              </div>

              {activeScheme === 'NOS' ? (
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>✈️</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      NOS Scheme (AZKMI): 20 Earmarked Seats Architecture
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem' }}>
                    Statutory guidelines mandate that <strong>3 out of 20 total seats</strong> are strictly reserved for Particularly Vulnerable Tribal Groups (PVTG).
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '1rem', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 700, color: '#B45309', fontSize: '0.92rem' }}>
                        1. PVTG Earmarked Quota (3 Seats)
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#78350F', marginTop: '0.35rem' }}>
                        The top 3 eligible PVTG candidates are automatically selected into these seats regardless of general rank. Any candidate ranked below position #17 is flagged with <code>isQuotaAdjusted: true</code> and awarded an audit explanation.
                      </p>
                    </div>

                    <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 700, color: '#15803D', fontSize: '0.92rem' }}>
                        2. General ST Merit Quota (17 Seats)
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#14532D', marginTop: '0.35rem' }}>
                        All non-PVTG ST candidates plus any remaining PVTG contenders compete strictly on academic merit (% in qualifying degree) to fill the remaining 17 seats.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>🎓</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      NFST Scheme (ARG45): Universal Merit with Statutory Preference
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem' }}>
                    Covers 750 annual fellowships for M.Phil and Ph.D. scholars in Indian universities.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', padding: '1rem', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.92rem' }}>
                        Master's Degree Merit Ordering
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.35rem' }}>
                        All eligible candidates (minimum 55% marks) are ranked descending by postgraduate percentage.
                      </p>
                    </div>

                    <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '1rem', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '0.92rem' }}>
                        Horizontal Priority Tags
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#1E40AF', marginTop: '0.35rem' }}>
                        Candidates belonging to PVTG or having UDID disability cards (Divyangan) receive formal preference flags in the committee review queue.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 10-STAGE AI PIPELINE */}
          {activeTab === 'ai_pipeline' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#7C3AED' }}>
                  The 10-Stage Optical & NLP Verification Pipeline
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Architecture of the automated document extraction and cross-check engine.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.75rem',
                  fontSize: '0.82rem'
                }}
              >
                {[
                  { n: '1', title: 'Ingestion & Malware Scan', desc: 'Validates PDF MIME type, size ceiling, and sha256 checksum.' },
                  { n: '2', title: 'Image Pre-processing', desc: 'Binarization, deskewing, and contrast normalization via OpenCV.' },
                  { n: '3', title: 'Multi-lingual OCR', desc: 'Tesseract OCR reading English, Hindi & regional tribal scripts.' },
                  { n: '4', title: 'Classification & NER', desc: 'Identifies document type & extracts Name, DOB, caste, marks.' },
                  { n: '5', title: 'Cross-Verification', desc: 'Compares form inputs vs extracted OCR fields for discrepancies.' },
                  { n: '6', title: 'Rule-Based Eligibility', desc: 'Validates scheme requirements (degree level, marks >= 55%).' },
                  { n: '7', title: 'Deficiency Detector', desc: 'Isolates unreadable scans or missing revenue authority seals.' },
                  { n: '8', title: 'Explainable Scoring', desc: 'Generates structured audit reason codes for every calculation.' },
                  { n: '9', title: 'Human-in-the-Loop Review', desc: 'Official inspects AI findings with one-click override option.' },
                  { n: '10', title: 'DBT Handoff', desc: 'Generates digital sanction letter and prepares PFMS payout payload.' }
                ].map((stg) => (
                  <div
                    key={stg.n}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '0.85rem',
                      display: 'flex',
                      gap: '0.65rem'
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#EDE9FE',
                        color: '#6D28D9',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {stg.n}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '0.2rem' }}>
                        {stg.title}
                      </div>
                      <div style={{ color: '#64748B', lineHeight: 1.4 }}>
                        {stg.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Adivasi Pragati Portal • Ministry of Tribal Affairs (MoTA) Solution
          </div>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Explorer
          </Button>
        </div>
      </div>
    </div>
  );
}
