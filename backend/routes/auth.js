import express from 'express'
import { login, signup, getDevelopers } from '../controllers/auth.controllers.js'
import { protectRoute } from '../middleware/auth.middleware.js';

const routes = express.Router()
routes.get('/developers', protectRoute, getDevelopers);
routes.post("/signup", signup)
routes.post("/login", login)

export default routes
