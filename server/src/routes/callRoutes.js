const express = require('express');
const { scheduleCall, getScheduledCalls } = require('../controllers/callController');

const router = express.Router();

router.post('/schedule', scheduleCall);
router.get('/scheduled', getScheduledCalls);

module.exports = router;
