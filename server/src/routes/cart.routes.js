const express = require('express');
const { validateCart } = require('../controllers/cart.controller');

const router = express.Router();

router.post('/validate', validateCart);

module.exports = router;
