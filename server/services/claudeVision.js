import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function extractBooksFromImage(imagePath) {
  try {
    console.log(`Using Claude Vision API for: ${imagePath}`);
    
    // Read the image file
    const imageBuffer = await fs.readFile(imagePath);
    const ext = path.extname(imagePath).toLowerCase().replace('.', '');
    
    // Determine media type
    let mediaType = 'image/jpeg';
    if (ext === 'png') mediaType = 'image/png';
    else if (ext === 'gif') mediaType = 'image/gif';
    else if (ext === 'webp') mediaType = 'image/webp';
    else if (ext === 'heic' || ext === 'heif') mediaType = 'image/heic';
    
    // Convert to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Please analyze this image of books and extract the book titles and authors visible. 
              Return ONLY a JSON array with the following format, no other text:
              [{"title": "Book Title", "author": "Author Name"}, ...]
              
              If you can see book spines, extract each book's title and author if visible.
              If the author is not clearly visible, use "Unknown Author".
              Only include books you can clearly identify.`,
            },
          ],
        },
      ],
    });
    
    const content = response.content[0].text;
    console.log('Claude response:', content);
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const books = JSON.parse(jsonMatch[0]);
        console.log(`Claude extracted ${books.length} books`);
        return books;
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
    }
    
    return [];
  } catch (error) {
    console.error('Claude Vision API error:', error);
    
    // Fall back to empty array if Claude API fails
    if (error.message?.includes('api_key')) {
      throw new Error('Claude API key not configured. Please add CLAUDE_API_KEY to environment variables.');
    }
    
    throw new Error(`Failed to analyze image with Claude: ${error.message}`);
  }
}