import express from 'express';
import {
  getRankedSelection,
  confirmSelection
} from '../controllers/selectionController.js';

const router = express.Router();

router.get('/:schemeCode', getRankedSelection);
router.post('/:schemeCode/confirm', confirmSelection);

export default router;
