import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');

// Process-level error handlers to prevent silent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// Validate dist directory exists before starting server
function validateDistDirectory() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`ERROR: dist directory does not exist at: ${DIST_DIR}`);
    console.error('Current directory:', __dirname);
    console.error('Please ensure the build process completed successfully.');
    process.exit(1);
  }

  if (!fs.existsSync(INDEX_PATH)) {
    console.error(`ERROR: index.html not found at: ${INDEX_PATH}`);
    console.error('Please ensure the build process completed successfully.');
    process.exit(1);
  }

  // Log directory structure in production for debugging
  if (process.env.NODE_ENV === 'production') {
    try {
      const distContents = fs.readdirSync(DIST_DIR);
      console.log('Dist directory contents:', distContents);
      console.log('Index.html exists:', fs.existsSync(INDEX_PATH));
    } catch (error) {
      console.error('Error reading dist directory:', error);
    }
  }
}

// Log directory contents for debugging in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Current directory:', __dirname);
  try {
    console.log('Directory contents:', fs.readdirSync(__dirname));
    console.log('Dist directory exists:', fs.existsSync(DIST_DIR));
  } catch (error) {
    console.error('Error reading directory:', error);
  }
}

// Validate before setting up routes
validateDistDirectory();

// Health check endpoint (must be before static files)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from dist directory
app.use(express.static(DIST_DIR));

// Handle client-side routing - return index.html for all routes
app.get('/{*path}', (req, res) => {
  if (fs.existsSync(INDEX_PATH)) {
    res.sendFile(INDEX_PATH);
  } else {
    console.error('Cannot find index.html at:', INDEX_PATH);
    res.status(404).send(`
      <h1>Error 404</h1>
      <p>Cannot find index.html</p>
      <p>Expected path: ${INDEX_PATH}</p>
      <p>Current directory: ${__dirname}</p>
    `);
  }
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from: ${DIST_DIR}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Handle server close
server.on('close', () => {
  console.log('Server closed');
}); 