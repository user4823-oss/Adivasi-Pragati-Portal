// Single API service for all backend fetch requests
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Helper to handle fetch responses safely
 */
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    return { success: true };
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

/**
 * Fetch all active schemes
 */
export async function fetchSchemes() {
  const res = await fetch(`${API_BASE_URL}/schemes`, {
    headers: { 'Accept': 'application/json' }
  });
  const json = await handleResponse(res);
  return json.data || [];
}

/**
 * Fetch a single scheme by code
 */
export async function fetchSchemeByCode(code) {
  const res = await fetch(`${API_BASE_URL}/schemes/${code}`, {
    headers: { 'Accept': 'application/json' }
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Create a new scheme configuration (Admin)
 */
export async function createScheme(schemeData) {
  const res = await fetch(`${API_BASE_URL}/schemes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(schemeData)
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Update an existing scheme configuration (Admin)
 */
export async function updateScheme(code, schemeData) {
  const res = await fetch(`${API_BASE_URL}/schemes/${code}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(schemeData)
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Fetch all applications (for Admin dashboard)
 */
export async function fetchApplications() {
  const res = await fetch(`${API_BASE_URL}/applications`, {
    headers: { 'Accept': 'application/json' }
  });
  const json = await handleResponse(res);
  return json.data || [];
}

/**
 * Fetch a single application by ID
 */
export async function fetchApplicationById(id) {
  const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
    headers: { 'Accept': 'application/json' }
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Fetch the latest application for a specific applicant email
 */
export async function fetchLatestApplication(email = 'applicant@nfst.gov.in') {
  const res = await fetch(`${API_BASE_URL}/applications?email=${encodeURIComponent(email)}`, {
    headers: { 'Accept': 'application/json' }
  });
  const json = await handleResponse(res);
  return json.data || null;
}

/**
 * Submit a new scholarship application (scheme-aware)
 */
export async function submitApplication(applicationData) {
  const res = await fetch(`${API_BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(applicationData)
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Update an application status (Approve / Reject / Under Review / Deficiency Raised)
 */
export async function updateApplicationStatus(id, status, remarks = '', flagReason = null, flaggedDocument = null) {
  const res = await fetch(`${API_BASE_URL}/applications/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ status, remarks, flagReason, flaggedDocument })
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Resubmit corrected document(s) on a flagged deficiency
 */
export async function resubmitApplication(id, documents, resubmissionNote = '') {
  const res = await fetch(`${API_BASE_URL}/applications/${id}/resubmit`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ documents, resubmissionNote })
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Fetch quota-aware ranked selection list for a scheme (Admin)
 */
export async function fetchRankedSelection(schemeCode) {
  const res = await fetch(`${API_BASE_URL}/selection/${schemeCode}`, {
    headers: { 'Accept': 'application/json' }
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Confirm bulk selection decisions for a scheme (Admin)
 * selections = array of { id, proposedStatus, overrideReason?, overriddenBy? }
 */
export async function confirmSelections(schemeCode, selections, committeeRemarks = '') {
  const res = await fetch(`${API_BASE_URL}/selection/${schemeCode}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ selections, committeeRemarks })
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Advance an application's post-selection lifecycle state (Admin)
 */
export async function advanceLifecycle(id, nextStatus, note = '', proofDocument = null, changedBy = 'MoTA Admin') {
  const res = await fetch(`${API_BASE_URL}/applications/${id}/lifecycle`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ nextStatus, note, proofDocument, changedBy })
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Fetch sanction letter data for a selected applicant (Admin / Print)
 */
export async function fetchSanctionLetter(id) {
  const res = await fetch(`${API_BASE_URL}/applications/${id}/sanction-letter`, {
    headers: { 'Accept': 'application/json' }
  });
  const json = await handleResponse(res);
  return json.data;
}
