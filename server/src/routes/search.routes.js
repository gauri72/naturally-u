const express = require('express');
const { search } = require('../controllers/search.controller');

const router = express.Router();

// Public - site-wide search (products + CMS pages)
router.get('/', search);

module.exports = router;
