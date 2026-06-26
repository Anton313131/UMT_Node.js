const prisma = require('../client');

async function loadAnnouncement(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (announcement.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to modify this announcement' });
    }

    req.announcement = announcement;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { loadAnnouncement };
