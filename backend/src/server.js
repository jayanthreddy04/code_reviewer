import app from './app.js';
import config from './config/index.js';
import { connectDatabase } from './config/database.js';

const startServer = async () => {
  await connectDatabase();

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
    console.log(`Health check: http://localhost:${config.port}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `\nPort ${config.port} is already in use.\n` +
          `  • Stop the other process, or set PORT to a free port in backend/.env\n` +
          `  • On macOS, port 5000 is often taken by AirPlay — use PORT=5001 (default)\n` +
          `  • Find what's using the port: lsof -i :${config.port}\n`
      );
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
