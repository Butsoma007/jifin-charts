import express from 'express'
import {
  generateChart, getUserCharts,
  getChart, deleteDataset
} from '../controllers/chartController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/generate', authMiddleware, generateChart)
router.get('/', authMiddleware, getUserCharts)
router.get('/:id', authMiddleware, getChart)
router.delete('/:id', authMiddleware, deleteDataset)

export default router