import { Application } from '../models/Application.js';

export const getApplications = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (email) {
      const latest = await Application.findLatestByEmail(email);
      return res.json({ success: true, data: latest });
    }
    const applications = await Application.findAll();
    res.json({ success: true, data: applications, count: applications.length });
  } catch (err) {
    next(err);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: `Application ${id} not found.` });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const { name, dob, course, institution, marksPercentage } = req.body;
    if (!name || !dob || !course || !institution || marksPercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, dob, course, institution, marksPercentage are mandatory.'
      });
    }

    const marks = parseFloat(marksPercentage);
    if (isNaN(marks) || marks < 0 || marks > 100) {
      return res.status(400).json({
        success: false,
        message: 'Marks percentage must be a valid number between 0 and 100.'
      });
    }

    const application = await Application.create(req.body);
    const isDuplicate = application.status === 'Flagged - Possible Duplicate';

    res.status(201).json({
      success: true,
      message: isDuplicate
        ? 'Application submitted, but flagged for duplicate verification against existing records.'
        : `Application submitted successfully under Scheme ${application.schemeCode}.`,
      data: application
    });
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks, flagReason, flaggedDocument } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status field is required.' });
    }

    const updated = await Application.updateStatus(id, status, remarks, flagReason, flaggedDocument);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Application ${id} not found.` });
    }

    res.json({
      success: true,
      message: `Application ${id} status updated to ${status}.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

export const resubmitApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { documents, resubmissionNote } = req.body;

    if (!documents || Object.keys(documents).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one corrected document must be provided for resubmission.'
      });
    }

    const updated = await Application.resubmit(id, documents, resubmissionNote);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Application ${id} not found.` });
    }

    res.json({
      success: true,
      message: `Application ${id} resubmitted successfully. Status returned to Under Review.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

export const advanceLifecycle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nextStatus, note, proofDocument, changedBy } = req.body;

    if (!nextStatus) {
      return res.status(400).json({ success: false, message: 'nextStatus is required.' });
    }

    const updated = await Application.advanceLifecycle(id, nextStatus, changedBy, note, proofDocument);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Application ${id} not found.` });
    }

    res.json({
      success: true,
      message: `Application ${id} advanced to ${nextStatus}.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

export const getSanctionLetter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: `Application ${id} not found.` });
    }

    const isNos = application.schemeCode === 'AZKMI';
    const rateLabel = isNos
      ? `₹${(application.fellowshipAmount || 1500000).toLocaleString('en-IN')}/year + Full Tuition Abroad`
      : `₹${(application.fellowshipAmount || 28000).toLocaleString('en-IN')}/month`;

    const sanctionLetter = {
      awardNumber: `MoTA/${application.schemeCode || 'NFST'}/${new Date().getFullYear()}/${application.id}`,
      issueDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      applicantName: application.name,
      applicantDob: application.dob,
      category: 'Scheduled Tribe (ST)',
      specialCategory: application.specialCategory !== 'None' ? application.specialCategory : null,
      schemeCode: application.schemeCode,
      schemeName: application.schemeName || 'National Fellowship for ST Students',
      course: application.course,
      institution: application.institution,
      fellowshipRate: rateLabel,
      tenure: isNos ? 'Up to 3 years abroad (subject to admission verification within 2 years)' : '5 Years (2 yrs JRF + 3 yrs SRF)',
      ministryOfficer: 'Under Secretary to the Government of India',
      ministryDepartment: 'Ministry of Tribal Affairs (Scholarship Division), Shastri Bhawan, New Delhi'
    };

    res.json({ success: true, data: sanctionLetter });
  } catch (err) {
    next(err);
  }
};
