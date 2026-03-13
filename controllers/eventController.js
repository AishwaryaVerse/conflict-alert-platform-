const Event = require('../models/Event');
const eventService = require('../services/eventService');

exports.getAllEvents = async (req, res) => {
  res.json(eventService.events);
};

exports.getEventById = async (req, res) => {
  const event = eventService.events.find(e => e._id === req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
};

exports.submitReport = async (req, res) => {
  const { text, username, followerCount, verified, latitude, longitude, timestamp, imageUrl } = req.body;
  console.log('Processing report:', req.body);
  try {
    const event = await eventService.processReport({ text, username, followerCount, verified, latitude, longitude, timestamp, imageUrl });
    console.log('Created/updated event:', event);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};