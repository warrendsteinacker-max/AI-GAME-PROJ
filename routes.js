import express from 'express'

import { PPP } from './server/PPP' 

export const router = express.Router()

router.post('/pp', PPP)

