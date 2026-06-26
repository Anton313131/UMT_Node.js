const express = require('express');
const controller = require('../controllers/announcements.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { loadAnnouncement } = require('../middleware/ownership.middleware');
const { imageField } = require('../middleware/upload.middleware');
const {
  validateCreate,
  validateUpdate,
  validateListQuery,
} = require('../validators/announcements.validator');

const router = express.Router();

/**
 * @openapi
 * /announcements:
 *   get:
 *     tags: [Announcements]
 *     summary: List announcements (public)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 50, default: 5 } }
 *       - { in: query, name: search, schema: { type: string }, description: search in title }
 *       - { in: query, name: category, schema: { $ref: '#/components/schemas/Category' } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [createdAt, price, title], default: createdAt } }
 *       - { in: query, name: order, schema: { type: string, enum: [asc, desc], default: desc } }
 *     responses:
 *       200: { description: Paginated list, schema: AnnouncementList }
 *       400: { description: Invalid query }
 */
router.get('/', validateListQuery, controller.list);

/**
 * @openapi
 * /announcements/{id}:
 *   get:
 *     tags: [Announcements]
 *     summary: Get one announcement (public)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Announcement, schema: Announcement }
 *       404: { description: Not found }
 */
router.get('/:id', controller.getOne);

/**
 * @openapi
 * /announcements:
 *   post:
 *     tags: [Announcements]
 *     summary: Create announcement (auth)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AnnouncementInput' }
 *         multipart/form-data:
 *           schema: { $ref: '#/components/schemas/AnnouncementFormInput' }
 *     responses:
 *       201: { description: Created, schema: Announcement }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 */
router.post('/', requireAuth, imageField, validateCreate, controller.create);

/**
 * @openapi
 * /announcements/{id}:
 *   patch:
 *     tags: [Announcements]
 *     summary: Update announcement (owner only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AnnouncementInput' }
 *         multipart/form-data:
 *           schema: { $ref: '#/components/schemas/AnnouncementFormInput' }
 *     responses:
 *       200: { description: Updated, schema: Announcement }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.patch(
  '/:id',
  requireAuth,
  loadAnnouncement,
  imageField,
  validateUpdate,
  controller.update
);

/**
 * @openapi
 * /announcements/{id}:
 *   delete:
 *     tags: [Announcements]
 *     summary: Delete announcement (owner only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.delete('/:id', requireAuth, loadAnnouncement, controller.remove);

module.exports = router;
