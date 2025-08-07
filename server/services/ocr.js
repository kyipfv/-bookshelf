import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';

export async function processImage(imagePath) {
  try {
    console.log(`Starting OCR for: ${imagePath}`);
    let imageBuffer;
    const ext = path.extname(imagePath).toLowerCase();
    
    // Convert HEIC/HEIF to JPEG first if needed
    if (ext === '.heic' || ext === '.heif') {
      console.log('Converting HEIC/HEIF to JPEG...');
      imageBuffer = await sharp(imagePath)
        .jpeg({ quality: 95 })
        .toBuffer();
    } else {
      imageBuffer = await sharp(imagePath).toBuffer();
    }
    
    // Process image for better OCR results
    const processedImage = await sharp(imageBuffer)
      .resize(2400, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();

    console.log('Running OCR...');
    const { data: { text } } = await Tesseract.recognize(
      processedImage,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    console.log(`OCR complete. Extracted ${text.length} characters`);
    return text || '';
  } catch (error) {
    console.error('OCR processing error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('sharp')) {
      throw new Error('Failed to process image format. Try a different image.');
    } else if (error.message.includes('tesseract')) {
      throw new Error('Failed to extract text from image. Try a clearer photo.');
    } else {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }
}