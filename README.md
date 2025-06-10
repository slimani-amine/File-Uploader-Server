# File Uploader Server

A Node.js/Express server for handling file uploads with TypeScript support.

## Features

- File upload handling with multer
- TypeScript support
- Express server with proper routing
- Environment variable configuration
- File storage management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd file-uploader-server
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=fileUploader
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif
NODE_ENV=development
```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The server will start on http://localhost:3000 (or the port specified in your .env file).

## API Endpoints

- `POST /api/upload` - Upload a file
- `GET /api/files` - Get list of uploaded files
- `GET /api/files/:id` - Get a specific file
- `DELETE /api/files/:id` - Delete a file

## Building for Production

To build the project:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm start
# or
yarn start
```

## License

MIT
