import express from 'express';
import cors from 'cors';
import applicationRoutes from './routes/applications.js';
import authRoutes from './routes/auth.js';
import schemeRoutes from './routes/schemes.js';
import selectionRoutes from './routes/selection.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'MoTA ST Scholarship System (NFST & NOS Schemes) API',
    schemes: ['ARG45', 'AZKMI'],
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/selection', selectionRoutes);
app.use('/api/applications', applicationRoutes);

// Error Handling Middleware
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`MoTA NFST Backend API running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const ALT_PORT = Number(PORT) + 1;
    console.warn(`Port ${PORT} in use, attempting port ${ALT_PORT}...`);
    app.listen(ALT_PORT, () => {
      console.log(`MoTA NFST Backend API running at http://localhost:${ALT_PORT}`);
    });
  } else {
    console.error('Server error:', err);
  }
});

export default app;
