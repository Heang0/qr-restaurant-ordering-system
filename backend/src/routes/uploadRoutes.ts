import express from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import ImageKit from 'imagekit';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Configure ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

// Extend the Request type to include the file property from Multer
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// @ts-ignore
router.post('/', upload.single('file'), async (req: RequestWithFile, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('--- Upload Request Started ---');
    
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer, // required
      fileName: `profile-${Date.now()}-${req.file.originalname}`, // required
      folder: '/menu-order', // Save in the menu-order folder
    });

    console.log('ImageKit Upload Success:', uploadResponse.url);
    res.json({ 
      url: uploadResponse.url,
      fileId: uploadResponse.fileId 
    });
  } catch (error: any) {
    console.error('ImageKit Upload Error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.message || 'Unknown error' 
    });
  }
});

export default router;
