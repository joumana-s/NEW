import app from './app.js';

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}).on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please try these solutions:`);
    console.error('1. Kill the process using the port');
    console.error('2. Use a different port by setting the PORT environment variable');
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
