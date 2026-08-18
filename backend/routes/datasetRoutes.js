import express from 'express'
import {
  createDataset, getUserDatasets,
  getDataset, updateDataset, deleteDataset
} from '../controllers/datasetController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', authMiddleware, createDataset)
router.get('/', authMiddleware, getUserDatasets)
router.get('/:id', authMiddleware, getDataset)
router.put('/:id', authMiddleware, updateDataset)
router.delete('/:id', authMiddleware, deleteDataset)

export default router