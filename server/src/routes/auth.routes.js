const express = require('express');
const { protect } = require('../middleware/auth');
const { login, logout, getMe } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
