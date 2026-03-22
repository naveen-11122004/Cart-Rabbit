const express = require('express');
const router = express.Router();
const {
  postStatus,
  getStatuses,
  markViewed,
  deleteStatus,
} = require('../controllers/statusController');

// POST   /api/status              — Post a new status
router.post('/', postStatus);

// GET    /api/status/:userId      — Get statuses (own + others), ?currentUserId=<id>
router.get('/:userId', getStatuses);

// PUT    /api/status/:statusId/view — Mark status viewed
router.put('/:statusId/view', markViewed);

// DELETE /api/status/:statusId    — Delete own status
router.delete('/:statusId', deleteStatus);

module.exports = router;
