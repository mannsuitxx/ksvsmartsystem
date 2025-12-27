const express = require('express');
const router = express.Router();
const { addClassUpdate, getClassUpdates } = require('../controllers/classUpdateController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('faculty'), addClassUpdate);
router.get('/', protect, authorize('faculty', 'admin', 'hod'), getClassUpdates);

module.exports = router;
