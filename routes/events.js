const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// GET /api/events
router.get('/events', eventController.getAllEvents);

// GET /api/events/:id
router.get('/events/:id', eventController.getEventById);

// POST /api/report
router.post('/report', eventController.submitReport);

module.exports = router;