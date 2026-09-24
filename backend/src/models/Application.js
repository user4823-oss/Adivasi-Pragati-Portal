import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Scheme } from './Scheme.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.join(__dirname, '..', 'data', 'applications.json');

export const VALID_STATUSES = [
  'Submitted',
  'Under Review',
  'Selected',
  'Not Selected',
  'Rejected',
  'Deficiency Raised',
  'Flagged - Possible Duplicate',
  'Sanction Letter Generated',
  'Admission Proof Pending',
  'Disbursed',
  'Renewal Pending',
  'Renewed'
];

function normalizeString(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Fuzzy matches candidate Name + DOB against existing applications
 */
function findDuplicateApplicant(candidate, existingList) {
  const cName = normalizeString(candidate.name);
  const cDob = (candidate.dob || '').trim();

  if (!cName || !cDob) return null;

  for (const app of existingList) {
    const aName = normalizeString(app.name);
    const aDob = (app.dob || '').trim();

    if (cName === aName && cDob === aDob) {
      return app;
    }

    if (cDob === aDob) {
      const cTokens = (candidate.name || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
      const aTokens = (app.name || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
      const shared = cTokens.filter((t) => aTokens.includes(t));
      if (shared.length >= 2 || (cTokens.length === 1 && aTokens.length === 1 && cTokens[0] === aTokens[0])) {
        return app;
      }
    }
  }

  return null;
}

export class Application {
  static async readData() {
    try {
      const content = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      const list = JSON.parse(content || '[]');
      // Ensure all loaded applications have an auditTrail array
      return list.map((app) => {
        if (!app.auditTrail || !Array.isArray(app.auditTrail)) {
          app.auditTrail = [
            {
              timestamp: app.submittedAt || new Date().toISOString(),
              fromStatus: null,
              toStatus: app.status || 'Submitted',
              changedBy: app.applicantEmail || 'Applicant',
              reason: app.remarks || 'Application submission recorded'
            }
          ];
        }
        return app;
      });
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
        await fs.writeFile(DATA_FILE_PATH, '[]', 'utf-8');
        return [];
      }
      throw err;
    }
  }

  static async writeData(data) {
    const tempFile = `${DATA_FILE_PATH}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempFile, DATA_FILE_PATH);
  }

  static async findAll() {
    return await this.readData();
  }

  static async findById(id) {
    const list = await this.readData();
    return list.find((app) => app.id === id) || null;
  }

  static async findLatestByEmail(email) {
    const list = await this.readData();
    const matches = list.filter((app) => app.applicantEmail?.toLowerCase() === email?.toLowerCase());
    if (matches.length === 0) return null;
    return matches.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
  }

  static async findByScheme(schemeCode) {
    const list = await this.readData();
    return list.filter((app) => (app.schemeCode || '').toUpperCase() === schemeCode.toUpperCase());
  }

  static async create(payload) {
    const list = await this.readData();
    const schemeCode = (payload.schemeCode || 'ARG45').trim().toUpperCase();

    let scheme = null;
    try {
      scheme = await Scheme.findByCode(schemeCode);
    } catch (e) {
      // Ignore fallback
    }

    const schemeName = payload.schemeName || scheme?.schemeName || 'National Fellowship for Higher Education of ST Students (NFST)';
    const course = payload.course || (scheme?.eligibility?.degreeLevels?.[0] || 'PhD');

    let fellowshipAmount = payload.fellowshipAmount;
    if (!fellowshipAmount) {
      if (scheme?.benefitAmount?.rates?.[course]) {
        fellowshipAmount = scheme.benefitAmount.rates[course];
      } else if (course === 'M.Phil') {
        fellowshipAmount = 25000;
      } else if (course === 'PhD') {
        fellowshipAmount = 28000;
      } else {
        fellowshipAmount = 1500000;
      }
    }

    const prefix = schemeCode === 'AZKMI' ? 'NOS' : 'NFST';
    const newSeq = String(list.length + 1).padStart(3, '0');
    const year = new Date().getFullYear();
    const id = `${prefix}-${year}-${newSeq}`;

    const matchedDuplicate = findDuplicateApplicant(payload, list);

    let initialStatus = 'Submitted';
    let duplicateOf = null;
    let initialRemarks = payload.remarks || `Application submitted under Scheme ${schemeCode}.`;

    if (matchedDuplicate) {
      initialStatus = 'Flagged - Possible Duplicate';
      duplicateOf = matchedDuplicate.id;
      initialRemarks = `Automated Duplicate Flag: Candidate details closely match existing application ${matchedDuplicate.id} (${matchedDuplicate.name}, DOB: ${matchedDuplicate.dob}). Flagged for committee review.`;
    }

    const now = new Date().toISOString();

    const newApplication = {
      id,
      applicantEmail: payload.applicantEmail || 'applicant@nfst.gov.in',
      name: payload.name.trim(),
      dob: payload.dob,
      category: 'ST',
      specialCategory: payload.specialCategory || 'None',
      specialCategoryDetails: payload.specialCategoryDetails || '',
      schemeCode,
      schemeName,
      course,
      fellowshipAmount,
      institution: (payload.institution || '').trim(),
      marksPercentage: parseFloat(payload.marksPercentage),
      annualIncome: payload.annualIncome !== undefined && payload.annualIncome !== null && payload.annualIncome !== ''
        ? parseFloat(payload.annualIncome)
        : null,
      documents: payload.documents || {},
      status: initialStatus,
      duplicateOf,
      flagReason: null,
      flaggedDocument: null,
      overrideReason: null,
      overriddenBy: null,
      submittedAt: now,
      updatedAt: now,
      remarks: initialRemarks,
      auditTrail: [
        {
          timestamp: now,
          fromStatus: null,
          toStatus: initialStatus,
          changedBy: payload.applicantEmail || 'Applicant',
          reason: initialRemarks
        }
      ]
    };

    list.unshift(newApplication);
    await this.writeData(list);
    return newApplication;
  }

  static async updateStatus(id, newStatus, remarks, flagReason = null, flaggedDocument = null, changedBy = 'Ministry Officer', overrideReason = null) {
    if (!VALID_STATUSES.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const list = await this.readData();
    const index = list.findIndex((app) => app.id === id);
    if (index === -1) {
      return null;
    }

    const current = list[index];
    const prevStatus = current.status;
    const now = new Date().toISOString();

    current.status = newStatus;
    current.updatedAt = now;

    if (remarks !== undefined && remarks !== null) {
      current.remarks = remarks;
    }

    if (overrideReason) {
      current.overrideReason = overrideReason;
      current.overriddenBy = changedBy;
    }

    if (newStatus === 'Deficiency Raised') {
      current.flagReason = flagReason || 'Deficiency noted during document verification.';
      if (flaggedDocument) {
        current.flaggedDocument = flaggedDocument;
      }
    } else if (newStatus === 'Under Review' || newStatus === 'Selected') {
      if (flagReason !== undefined) {
        current.flagReason = flagReason;
      }
    }

    // Append to audit trail
    if (!current.auditTrail || !Array.isArray(current.auditTrail)) {
      current.auditTrail = [];
    }

    current.auditTrail.push({
      timestamp: now,
      fromStatus: prevStatus,
      toStatus: newStatus,
      changedBy: changedBy || 'Ministry Officer',
      reason: overrideReason || remarks || flagReason || `Status updated from ${prevStatus} to ${newStatus}`
    });

    await this.writeData(list);
    return current;
  }

  static async resubmit(id, updatedDocuments, resubmissionNote = '') {
    const list = await this.readData();
    const index = list.findIndex((app) => app.id === id);
    if (index === -1) {
      return null;
    }

    const current = list[index];
    const prevStatus = current.status;
    const previousReason = current.flagReason;
    const now = new Date().toISOString();

    current.documents = {
      ...(current.documents || {}),
      ...(updatedDocuments || {})
    };

    current.status = 'Under Review';
    current.previousFlagReason = previousReason;
    current.flagReason = null;
    current.flaggedDocument = null;
    current.updatedAt = now;

    const noteText = resubmissionNote ? ` (Note: ${resubmissionNote})` : '';
    current.remarks = `Resubmitted document(s) on ${new Date().toLocaleDateString('en-IN')}${noteText}. Returned to Under Review queue.`;

    if (!current.auditTrail || !Array.isArray(current.auditTrail)) {
      current.auditTrail = [];
    }

    current.auditTrail.push({
      timestamp: now,
      fromStatus: prevStatus,
      toStatus: 'Under Review',
      changedBy: current.applicantEmail || 'Applicant',
      reason: resubmissionNote || 'Corrected document resubmitted; deficiency resolved.'
    });

    await this.writeData(list);
    return current;
  }

  /**
   * Advance post-selection lifecycle state machine
   */
  static async advanceLifecycle(id, nextStatus, changedBy = 'Ministry Desk Officer', note = '', proofDocument = null) {
    if (!VALID_STATUSES.includes(nextStatus)) {
      throw new Error(`Invalid lifecycle state: ${nextStatus}`);
    }

    const list = await this.readData();
    const index = list.findIndex((app) => app.id === id);
    if (index === -1) {
      return null;
    }

    const current = list[index];
    const prevStatus = current.status;
    const now = new Date().toISOString();

    current.status = nextStatus;
    current.updatedAt = now;

    if (proofDocument && typeof proofDocument === 'object') {
      current.documents = {
        ...(current.documents || {}),
        ...proofDocument
      };
    }

    const lifecycleRemark = note || `Lifecycle advanced to ${nextStatus}.`;
    current.remarks = lifecycleRemark;

    if (!current.auditTrail || !Array.isArray(current.auditTrail)) {
      current.auditTrail = [];
    }

    current.auditTrail.push({
      timestamp: now,
      fromStatus: prevStatus,
      toStatus: nextStatus,
      changedBy: changedBy || 'Ministry Desk Officer',
      reason: lifecycleRemark
    });

    await this.writeData(list);
    return current;
  }
}
