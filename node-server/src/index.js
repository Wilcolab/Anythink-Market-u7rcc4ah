const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logging middleware

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// In-memory storage for users and authentication
const users = new Map();
const tokens = new Map();

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = tokens.get(token);
  next();
};

// Health check endpoint with enhanced metrics
app.get('/health', (req, res) => {
  const metrics = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    activeUsers: users.size,
    activeSessions: tokens.size
  };
  res.json(metrics);
});

// Authentication endpoints
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (users.has(username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  users.set(username, { username, password });
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = Buffer.from(Math.random().toString()).toString('base64');
  tokens.set(token, username);
  res.json({ token });
});

// Protected routes
app.get('/api/profile', authenticate, (req, res) => {
  const user = users.get(req.user);
  res.json({ username: user.username });
});

app.post('/api/logout', authenticate, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  tokens.delete(token);
  res.json({ message: 'Logged out successfully' });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the Enhanced Node.js Server!',
    version: '2.0',
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Get server health metrics'
      },
      register: {
        method: 'POST',
        path: '/api/register',
        description: 'Register a new user'
      },
      login: {
        method: 'POST',
        path: '/api/login',
        description: 'Authenticate and get token'
      },
      profile: {
        method: 'GET',
        path: '/api/profile',
        description: 'Get user profile (protected)',
        auth: true
      },
      logout: {
        method: 'POST',
        path: '/api/logout',
        description: 'Logout and invalidate token',
        auth: true
      }
    }
  });
});

// Start server with enhanced logging
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Press CTRL+C to stop');
});
