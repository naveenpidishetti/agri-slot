import express from 'express';
import multer from 'multer';
import { ProduceScannerService } from '../services/produceScannerService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/scanner/analyze (Grain moisture & quality screening)
router.post('/analyze', upload.single('image'), (req, res) => {
  try {
    const { cropType = 'Paddy', farmerId } = req.body;
    
    const analysis = ProduceScannerService.analyzeProduce({
      farmerId: farmerId || (req.user ? req.user.id : 'guest'),
      cropType,
      imageMeta: req.file ? {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : {}
    });

    return res.json(analysis);
  } catch (err) {
    return res.status(500).json({ error: 'Scanner analysis failed: ' + err.message });
  }
});

// POST /api/scanner/disease-diagnosis (Crop Doctor & Leaf Disease Analysis)
router.post('/disease-diagnosis', upload.single('image'), (req, res) => {
  try {
    const { 
      cropType = 'Paddy', 
      plantPart = 'Leaf', 
      farmerId, 
      isInvalidPlant = false, 
      invalidReason = '' 
    } = req.body;

    const diagnosis = ProduceScannerService.diagnoseDisease({
      farmerId: farmerId || (req.user ? req.user.id : 'guest'),
      cropType,
      plantPart,
      isInvalidPlant: isInvalidPlant === 'true' || isInvalidPlant === true,
      invalidReason,
      imageMeta: req.file ? {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : {}
    });

    return res.json(diagnosis);
  } catch (err) {
    return res.status(500).json({ error: 'Disease diagnosis failed: ' + err.message });
  }
});

// GET /api/scanner/history
router.get('/history', authenticate, (req, res) => {
  const history = [];
  return res.json({ history });
});

export default router;
