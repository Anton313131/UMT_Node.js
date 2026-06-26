const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const logger = require('../logger');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

const imageField = upload.single('image');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file) {
  if (!file) return null;
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'announcements',
    });
    logger.info({ publicId: result.public_id }, 'Image uploaded to Cloudinary');
    return result.secure_url;
  } finally {
    try {
      await fs.promises.unlink(file.path);
    } catch {
      // ponytail: ignore unlink failures — temp file best-effort cleanup
    }
  }
}

module.exports = { upload, imageField, uploadToCloudinary };
