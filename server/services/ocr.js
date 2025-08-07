import Tesseract from 'tesseract.js';
import sharp from 'sharp';

export async function processImage(imagePath) {
  try {
    const processedImage = await sharp(imagePath)
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