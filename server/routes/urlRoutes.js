const express = require('express');
const { shortenUrl, redirectToOriginal } = require('../controllers/urlController');

const router = express.Router();

// POST /api/shorten
router.post('/shorten', shortenUrl);

// GET /:shortcode
router.get('/:shortcode', redirectToOriginal);

module.exports = router;