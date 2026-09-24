// Hardcoded AI Document Analysis (Fake OCR Extraction Output)
// Used in Admin Application Review Page to display automated document verification

export const mockDocumentAnalysis = {
  'NFST-2026-001': {
    confidenceScore: 98,
    documentTypeDetected: 'Central Government ST Caste Certificate (Form B)',
    extractedName: 'Mangal Soren',
    extractedDob: '1998-05-14',
    extractedCategory: 'ST (Santhal)',
    issuingAuthority: 'Sub-Divisional Officer, Dumka',
    mismatch: false,
    discrepancyDetails: null,
    structuredReason: null,
    flaggedDocument: null,
    ocrHighlights: [
      'Digital seal verified',
      'Name exact match with Form',
      'DOB verified with Class X/Master marksheet'
    ]
  },
  'NFST-2026-002': {
    confidenceScore: 95,
    documentTypeDetected: 'State Tribal Welfare Caste Certificate & UDID Card',
    extractedName: 'Sunita Jamatia',
    extractedDob: '1997-11-20',
    extractedCategory: 'ST (Jamatia)',
    issuingAuthority: 'District Magistrate, Gomati District',
    mismatch: false,
    discrepancyDetails: null,
    structuredReason: null,
    flaggedDocument: null,
    ocrHighlights: [
      'UDID Disability card: Locomotor disability 45% verified',
      'Valid caste certificate format',
      'Eligible for Divyangan priority preference'
    ]
  },
  'NFST-2026-003': {
    confidenceScore: 92,
    documentTypeDetected: 'PVTG Tribal Certification (Jharkhand State)',
    extractedName: 'Birsa Kujur',
    extractedDob: '1999-01-18',
    extractedCategory: 'ST - Birhor (PVTG)',
    issuingAuthority: 'Deputy Commissioner, Ranchi',
    mismatch: false,
    discrepancyDetails: null,
    structuredReason: null,
    flaggedDocument: null,
    ocrHighlights: [
      'Verified under Particularly Vulnerable Tribal Group (PVTG) registry',
      'Master of Arts marksheet verified (68.4%)',
      'High priority under Section 4.2 of NFST Guidelines'
    ]
  },
  'NFST-2026-004': {
    confidenceScore: 99,
    documentTypeDetected: 'ST Certificate & Master Marksheet',
    extractedName: 'Kamala Netam',
    extractedDob: '1996-09-04',
    extractedCategory: 'ST (Gond)',
    issuingAuthority: 'Tehsildar, Dindori',
    mismatch: false,
    discrepancyDetails: null,
    structuredReason: null,
    flaggedDocument: null,
    ocrHighlights: [
      'All identifiers match national repository',
      'Ph.D. admission confirmation letter attached'
    ]
  },
  'NFST-2026-005': {
    confidenceScore: 71,
    documentTypeDetected: 'District Caste Certificate & Marksheet Scan',
    extractedName: 'Rajeshwar Bodo',
    extractedDob: '1997-08-12', // Notice: application form has 1998-05-14
    extractedCategory: 'ST (Bodo)',
    issuingAuthority: 'Circle Officer, Kokrajhar',
    mismatch: true,
    discrepancyDetails: 'DOB Mismatch: Certificate OCR indicates 1997-08-12 whereas Application form declared 1998-05-14. Manual scrutiny required.',
    structuredReason: 'Date of Birth mismatch: Form declared 1998-05-14, but Certificate OCR detected 1997-08-12.',
    flaggedDocument: 'casteCertificate',
    ocrHighlights: [
      'Low contrast scan on page 2',
      'DOB does not match submitted birth certificate',
      'Flagged for review committee attention'
    ]
  },
  'NFST-2026-006': {
    confidenceScore: 96,
    documentTypeDetected: 'Central ST Certificate & M.Sc. Degree',
    extractedName: 'Anandi Rathwa',
    extractedDob: '1995-12-03',
    extractedCategory: 'ST (Rathwa)',
    issuingAuthority: 'Sub-Divisional Magistrate, Chhota Udepur',
    mismatch: false,
    discrepancyDetails: null,
    structuredReason: null,
    flaggedDocument: null,
    ocrHighlights: [
      'High confidence OCR score (96%)',
      'M.Sc. marksheet percentage verified (84.6%)'
    ]
  },
  'NOS-2026-007': {
    confidenceScore: 97,
    documentTypeDetected: 'Overseas Admission Offer & ST Certificate & Income Proof',
    extractedName: 'Laxman Murmu',
    extractedDob: '1996-07-22',
    extractedCategory: 'ST (Santhal)',
    issuingAuthority: 'Sub-Divisional Officer, Mayurbhanj',
    mismatch: false,
    discrepancyDetails: null,
    structuredReason: null,
    flaggedDocument: null,
    ocrHighlights: [
      'Unconditional admission offer from University of Oxford verified',
      'Annual income ₹4,20,000 within statutory ceiling of ₹6,00,000',
      'Candidate eligible for NOS Screening Committee Interview'
    ]
  }
};

export const STANDARD_DEFICIENCY_REASONS = [
  'Date of Birth mismatch: Form declared DOB differs from certificate OCR date.',
  'Name mismatch: Form declared name differs from OCR extracted document name.',
  'Annual income proof exceeds statutory ceiling (₹6 Lakhs) for this scheme.',
  'Caste certificate illegible or missing competent authority seal/signature.',
  'Postgraduate / Qualifying marksheet incomplete or missing grade transcript.',
  'Foreign university unconditional admission proof / offer letter missing.'
];

export const getMockAnalysisForApplication = (application) => {
  if (!application) return null;
  if (mockDocumentAnalysis[application.id]) {
    return mockDocumentAnalysis[application.id];
  }

  // Fallback for newly submitted applications during testing
  return {
    confidenceScore: 94,
    documentTypeDetected: `Automated Scan: ${application.schemeCode || 'ST'} Verification Dossier`,
    extractedName: application.name,
    extractedDob: application.dob,
    extractedCategory: application.category || 'ST',
    issuingAuthority: 'State Competent Authority (Automated Read)',
    mismatch: false,
    discrepancyDetails: null,
    structuredReason: null,
    flaggedDocument: null,
    ocrHighlights: [
      'Document structure conforms to MoTA guidelines',
      'Caste certificate number verified in tribal registry',
      'Academic transcript verified against declared percentage'
    ]
  };
};
