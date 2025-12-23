import express from 'express';
import {
  getTopbar,
  updateTopbar,
  getHero,
  updateHero,
  getFooter,
  updateFooter,
} from './cms.controller'; 

const router = express.Router();

// ========== TOPBAR ROUTES ==========
router.get('/topbar', getTopbar);
router.put('/topbar', updateTopbar);

// ========== HERO ROUTES ==========
router.get('/hero', getHero);
router.put('/hero', updateHero);

// ========== FOOTER ROUTES ==========
router.get('/footer', getFooter);
router.put('/footer', updateFooter);

export const CMSRouter = router;