# Bookshelf - Personal Library Cataloging App

A modern web application that lets users catalogue their personal libraries through photo uploads or manual entry, with automatic genre categorization and visual statistics.

## Features

- 📸 **Photo Upload**: Snap photos of your bookshelves and let OCR extract book titles automatically
- ✍️ **Manual Entry**: Add books manually with title, author, and genre
- 🔍 **Google Books Integration**: Automatically fetch book metadata and categories
- 📊 **Visual Statistics**: See your reading preferences with beautiful charts
- 🏷️ **Smart Categorization**: Books are automatically sorted into Fiction, History, Non-Fiction, or Uncategorized
- 👤 **Anonymous Usage**: No sign-up required - uses visitor IDs stored in localStorage

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma (SQLite)
- **OCR**: Tesseract.js for text extraction from images
- **Charts**: Chart.js for visualization
- **Image Processing**: Sharp for optimization

## Local Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone git@github.com:yourusername/bookshelf.git
cd bookshelf
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Google Books API key (optional but recommended):
```
DATABASE_URL="file:./dev.db"
GOOGLE_BOOKS_API_KEY="your_api_key_here"
PORT=3001
NODE_ENV=development
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## How It Works

### Anonymous Visitor IDs

The app uses a UUID-based visitor identification system:

1. On first visit, a unique UUID is generated and stored in localStorage
2. This visitor ID is sent with all API requests to associate books with the visitor
3. Books are kept separate per visitor without requiring authentication
4. Visitor data persists as long as localStorage is not cleared

### Book Capture Pipeline

1. **Photo Upload**:
   - Images are processed with Sharp for optimization
   - Tesseract.js extracts text via OCR
   - Text is parsed to identify potential book titles and authors
   - Google Books API fetches metadata for each identified book
   - Books are deduplicated and categorized by genre

2. **Manual Entry**:
   - Direct form input for title, author, and optional genre
   - Supports bulk entry of multiple books at once

### Genre Mapping

Books are automatically categorized based on Google Books categories:
- **Fiction**: Novels, fantasy, sci-fi, mystery, romance, etc.
- **History**: Biography, war, historical events, memoirs
- **Non-Fiction**: Science, technology, self-help, business, cooking, etc.
- **Uncategorized**: When genre cannot be determined

## Deployment

### Deploy to Render

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:yourusername/bookshelf.git
git push -u origin main
```

2. Create a new Web Service on [Render.com](https://render.com)

3. Connect your GitHub repository

4. Render will automatically detect the `render.yaml` file

5. Add environment variables in Render Dashboard:
   - `GOOGLE_BOOKS_API_KEY`: Your Google Books API key
   - `DATABASE_URL`: Will be auto-generated

6. Deploy! The app will be available at your Render URL

### Docker Deployment

Build and run with Docker:
```bash
docker build -t bookshelf .
docker run -p 3001:3001 -e GOOGLE_BOOKS_API_KEY=your_key bookshelf
```

## API Endpoints

- `GET /api/books?visitorId=` - List all books for a visitor
- `POST /api/books` - Add a book manually
- `POST /api/books/upload` - Upload and process book images
- `PUT /api/books/:id` - Update book details
- `DELETE /api/books/:id?visitorId=` - Delete a book

## Testing

Run the test suite:
```bash
npm test
```

Tests cover:
- Genre mapping logic
- Book parsing from OCR text
- Google Books API integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT