import { Router } from 'express'
import { getAll, searchUserByUsername } from '@/controllers/userController'
import { protect, restrictToAdmin } from '@/middlewares/apiProtect'

const router = Router()

router.get('/', protect, restrictToAdmin, getAll)
router.get('/:username', searchUserByUsername)

export default router
