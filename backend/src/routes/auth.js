import express from 'express';

const router = express.Router();

const DUMMY_USERS = {
  'applicant@nfst.gov.in': {
    password: 'applicant123',
    role: 'applicant',
    name: 'Mangal Soren',
    email: 'applicant@nfst.gov.in'
  },
  'admin@mota.gov.in': {
    password: 'admin123',
    role: 'admin',
    name: 'MoTA Desk Officer',
    email: 'admin@mota.gov.in'
  }
};

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Both email and password are required.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = DUMMY_USERS[normalizedEmail];

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Please use the demo credentials provided below.'
    });
  }

  return res.json({
    success: true,
    message: 'Authentication successful.',
    user: {
      email: user.email,
      role: user.role,
      name: user.name
    }
  });
});

export default router;
