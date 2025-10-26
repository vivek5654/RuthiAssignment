import express from 'express'
import { createIssue, getIssues, updateIssue, assignIssue,addComment } from '../controllers/issue.controllers.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const routes = express.Router()

routes.post('/', protectRoute, createIssue)
routes.get('/', protectRoute, getIssues)
routes.put('/:id', protectRoute, updateIssue)
routes.put('/:id/assign', protectRoute, assignIssue)
routes.post('/:issueId/comment', protectRoute, addComment);

export default routes
