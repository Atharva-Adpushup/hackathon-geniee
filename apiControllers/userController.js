const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).json({ email: 'fsdjklf@kewrle.com' });
});

module.exports = router;
