const Event = require('../models/Event');

// In-memory storage for demo
let events = [];

// Mock AI classification
function classifyReport(text) {
  const keywords = {
    drone: ['drone', 'uav', 'unmanned'],
    explosion: ['explosion', 'blast', 'boom'],
    missile: ['missile', 'rocket', 'strike'],
    conflict: ['attack', 'fighting', 'conflict']
  };
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => text.toLowerCase().includes(word))) {
      // Randomize confidence so simulated reports vary
      const confidence = 0.4 + Math.random() * 0.5; // 0.4 - 0.9
      return { type, confidence };
    }
  }
  return { type: 'conflict', confidence: 0.4 + Math.random() * 0.5 };
}

// Haversine distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateCredibility(classification, followerCount, verified, clusterSize) {
  let score = classification.confidence * 100;
  score += Math.min(followerCount / 100, 20); // Max 20 from followers
  if (verified) score += 10;
  score += clusterSize * 5; // More reports increase credibility
  return Math.min(score, 100);
}

function findNearbyEvent(latitude, longitude, timestamp) {
  const tenMinutesAgo = new Date(timestamp.getTime() - 10 * 60 * 1000);
  for (const event of events) {
    const distance = getDistance(latitude, longitude, event.latitude, event.longitude);
    // Merge only when very close (within ~1km) and recent
    if (distance <= 1 && event.timestamp >= tenMinutesAgo) {
      return event;
    }
  }
  return null;
}

function updateStatus(credibilityScore) {
  if (credibilityScore >= 70) return 'High Confidence';
  if (credibilityScore >= 40) return 'Developing';
  return 'Unverified';
}

exports.processReport = async (report) => {
  const { text, username, followerCount, verified, latitude, longitude, timestamp, imageUrl } = report;
  const classification = classifyReport(text);
  const reportTime = timestamp ? new Date(timestamp) : new Date();

  // Check for nearby event
  let event = findNearbyEvent(latitude, longitude, reportTime);

  if (event) {
    // Merge: increase reportCount, update credibility
    event.reportCount += 1;
    event.credibilityScore = calculateCredibility(classification, followerCount, verified, event.reportCount);
    event.status = updateStatus(event.credibilityScore);
  } else {
    // Create new event
    const credibilityScore = calculateCredibility(classification, followerCount, verified, 1);
    const status = updateStatus(credibilityScore);
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    event = {
      _id: uniqueId,
      type: classification.type,
      description: text,
      latitude,
      longitude,
      credibilityScore,
      reportCount: 1,
      status,
      timestamp: reportTime
    };
    events.push(event);
  }

  return event;
};

exports.events = events;