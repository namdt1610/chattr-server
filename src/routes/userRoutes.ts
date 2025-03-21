import { Router } from 'express'
import { getAll, searchUserByUsername } from '@/controllers/userController'

const router = Router()

router.get('/', getAll)
router.get('/:username', searchUserByUsername)

export default router
