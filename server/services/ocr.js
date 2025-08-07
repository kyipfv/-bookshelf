import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';

export async function processImage(imagePath) {
  try {
    let imageBuffer;
    const ext = path.extname(imagePath).toLowerCase();
    
    // Convert HEIC/HEIF to JPEG first if needed
    if (ext === '.heic' || ext === '.heif') {
      imageBuffer = await sharp(imagePath)
        .jpeg()
        .toBuffer();
    } else {
      imageBuffer = await sharp(imagePath).toBuffer();
    }
    
    const processedImage = await sharp(imageBuffer)
      .resize(2000, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .grayscale()
      .normalize()
      .toBuffer();

    const { data: { text } } = await Tesseract.recognize(
      processedImage,
      'eng',
      {
        logger: m => console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
      }
    );

    return text;
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process image');
  }
}