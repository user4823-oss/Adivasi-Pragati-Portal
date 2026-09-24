import express from 'express';
import {
  getSchemes,
  getSchemeByCode,
  createScheme,
  updateScheme
} from '../controllers/schemeController.js';

const router = express.Router();

router.get('/', getSchemes);
router.get('/:code', getSchemeByCode);
router.post('/', createScheme);
router.put('/:code', updateScheme);

export default router;
