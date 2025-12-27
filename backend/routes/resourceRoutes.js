const express = require('express');
const router = express.Router();
const { uploadResource, getResources } = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const uploadFile = require('../middleware/fileUploadMiddleware');

router.post('/', protect, authorize('admin'), uploadFile.single('file'), uploadResource);
router.get('/', protect, getResources);

module.exports = router;
