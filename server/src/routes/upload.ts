import { Router } from 'express';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

import { AuditService } from '../services/auditService.js';

export const uploadRouter = Router();

// Store file in memory to validate magic bytes before uploading to Supabase
const storage = multer.memoryStorage();

// Max 5MB file size
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

uploadRouter.post('/', requireAuth, upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  try {
    // 1. Magic Bytes Validation
    const fileType = await fileTypeFromBuffer(req.file.buffer);
    if (!fileType) {
      return res.status(400).json({ success: false, error: 'Unable to determine file type' });
    }

    if (!ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid file signature: ${fileType.mime}. Allowed types: PDF, JPEG, PNG` 
      });
    }

    // 2. Validate against explicit extension tampering
    const extension = req.file.originalname.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    if (!extension || !validExtensions.includes(extension)) {
      return res.status(400).json({ success: false, error: 'Invalid file extension' });
    }

    // 3. Upload to Supabase Storage
    // Assuming users upload to their own bucket directory based on role
    const bucketName = (req.user?.role === 'NGO') ? 'ngo_documents' : 'restaurant_documents';
    const filePath = `${req.user?.id}/${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, req.file.buffer, {
        contentType: fileType.mime,
        upsert: false
      });

    if (error) {
      console.error("Storage upload error:", error);
      return res.status(500).json({ success: false, error: 'Failed to upload to storage' });
    }

    
    await AuditService.log({
      action: 'DOCUMENT_UPLOAD',
      entity: 'storage',
      entityId: data.path,
      userId: req.user?.id || null,
      role: req.user?.role || null,
      newState: { fileName: req.file.originalname, size: req.file.size, mime: fileType.mime },
      ip: req.ip,
      requestId: (req as any).id
    });

    // Provide the public or signed URL path depending on your bucket configuration
    res.json({
      success: true,
      path: data.path,
      message: 'File uploaded securely'
    });

  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: 'Internal server error during upload' });
  }
});

