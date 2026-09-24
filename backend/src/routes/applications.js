import express from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  resubmitApplication,
  advanceLifecycle,
  getSanctionLetter
} from '../controllers/applicationController.js';

const router = express.Router();

router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.get('/:id/sanction-letter', getSanctionLetter);
router.post('/', createApplication);
router.patch('/:id/status', updateApplicationStatus);
router.patch('/:id/resubmit', resubmitApplication);
router.patch('/:id/lifecycle', advanceLifecycle);

export default router;
