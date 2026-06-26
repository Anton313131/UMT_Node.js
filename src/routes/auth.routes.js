const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  validateRegister,
  validateLogin,
} = require('../validators/auth.validator');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201: { description: User created, schema: AuthResponse }
 *       400: { description: Validation error }
 *       409: { description: Username already exists }
 *       429: { description: Too many requests }
 */
router.post('/register', authLimiter, validateRegister, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200: { description: Logged in, schema: AuthResponse }
 *       400: { description: Validation error }
 *       401: { description: Invalid credentials }
 *       429: { description: Too many requests }
 */
router.post('/login', authLimiter, validateLogin, authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate tokens using the refreshToken cookie
 *     responses:
 *       200: { description: New tokens, schema: TokenPair }
 *       401: { description: Missing or invalid refresh token }
 */
router.post('/refresh', authLimiter, authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke refresh token and clear cookie
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Current authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user, schema: User }
 *       401: { description: Unauthorized }
 */
router.get('/me', requireAuth, authController.me);

module.exports = router;
