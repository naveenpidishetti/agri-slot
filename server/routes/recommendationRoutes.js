import express from 'express';
import { RecommendationService, SOIL_TYPES, SEASONS, PREVIOUS_CROPS, AGRONOMY_KNOWLEDGE } from '../services/recommendationService.js';

const router = express.Router();

// GET all metadata (Soil types, seasons, previous crops, available target crops)
router.get('/meta', (req, res) => {
  try {
    const crops = Object.keys(AGRONOMY_KNOWLEDGE).map(key => ({
      id: key,
      name: AGRONOMY_KNOWLEDGE[key].name
    }));

    res.json({
      success: true,
      soilTypes: SOIL_TYPES,
      seasons: SEASONS,
      previousCrops: PREVIOUS_CROPS,
      crops
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendation metadata', message: err.message });
  }
});

// POST Generate Full Seed, Fertilizer & Pesticide Advisory
router.post('/crop-advisory', async (req, res) => {
  try {
    const {
      soilTypeId,
      season,
      previousCropId,
      soilPH,
      fertilityLevel,
      farmSizeAcres,
      targetCropId,
      state,
      district,
      irrigationType,
      language
    } = req.body;

    const recommendation = await RecommendationService.generateRecommendation({
      soilTypeId,
      season,
      previousCropId,
      soilPH: soilPH ? parseFloat(soilPH) : 7.2,
      fertilityLevel: fertilityLevel || 'Medium',
      farmSizeAcres: farmSizeAcres ? parseFloat(farmSizeAcres) : 2.0,
      targetCropId,
      state: state || 'Telangana',
      district: district || 'Warangal',
      irrigationType: irrigationType || 'Borewell / Canal Drip',
      language: language || 'en'
    });

    res.json(recommendation);
  } catch (err) {
    console.error('Crop advisory error:', err);
    res.status(500).json({ error: 'Failed to generate recommendation', message: err.message });
  }
});

export default router;
