import multer from 'multer';

const MAGIC_BYTES = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF],
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47],
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46],
  ],
};

function detectMimeFromBuffer(buffer) {
  for (const [mime, signatures] of Object.entries(MAGIC_BYTES)) {
    for (const sig of signatures) {
      if (sig.every((byte, i) => buffer[i] === byte)) {
        if (mime === 'image/webp') {
          const webpMarker = buffer.slice(8, 12).toString('ascii');
          if (webpMarker !== 'WEBP') continue;
        }
        return mime;
      }
    }
  }
  return null;
}

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
};

export function validateMagicBytes(req, res, next) {
  const files = req.files || (req.file ? [req.file] : []);
  for (const file of files) {
    const detected = detectMimeFromBuffer(file.buffer);
    if (!detected) {
      return res.status(400).json({ message: 'محتوى الملف غير صالح: الصورة غير معروفة.' });
    }
    file.mimetype = detected;
  }
  next();
}
export const uploadSingle = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');
export const uploadMultiple = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
}).array('images', 10);
export const handleUploadSingle = (req, res, next) => {
    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        }
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

export const handleUploadMultiple = (req, res, next) => {
    uploadMultiple(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        }
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};
