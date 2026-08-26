import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import datasetRoutes from './routes/datasetRoutes.js'
import chartRoutes from './routes/chartRoutes.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())        
app.use(express.urlencoded({ extended: true }))  

// routes
app.use('/api/auth', authRoutes)
app.use('/api/datasets', datasetRoutes)
app.use('/api/charts', chartRoutes)

app.get('/', (req, res) => res.send('Jifin Charts API running'))

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
)