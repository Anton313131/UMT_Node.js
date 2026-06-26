const prisma = require('../client');
const logger = require('../logger');
const { uploadToCloudinary } = require('../middleware/upload.middleware');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, search, category, sortBy, order } = req.query;

    const where = {};
    if (search) where.title = { contains: search };
    if (category) where.category = category;

    const skip = (page - 1) * limit;

    const [totalItems, data] = await Promise.all([
      prisma.announcement.count({ where }),
      prisma.announcement.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return res.status(200).json({
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    return res.status(200).json(announcement);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body, userId: req.user.id };

    if (req.file) {
      data.imageUrl = await uploadToCloudinary(req.file);
    }

    const announcement = await prisma.announcement.create({ data });
    logger.info({ id: announcement.id, userId: req.user.id }, 'Announcement created');
    return res.status(201).json(announcement);
  } catch (err) {
    if (req.file) await uploadToCloudinary(req.file).catch(() => {});
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.imageUrl = await uploadToCloudinary(req.file);
    }

    const updated = await prisma.announcement.update({
      where: { id: req.announcement.id },
      data,
    });

    logger.info({ id: updated.id, userId: req.user.id }, 'Announcement updated');
    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await prisma.announcement.delete({ where: { id: req.announcement.id } });
    logger.info({ id: req.announcement.id, userId: req.user.id }, 'Announcement deleted');
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
};
