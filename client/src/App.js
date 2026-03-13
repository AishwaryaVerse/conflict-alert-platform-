import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({ type: '', status: '', date: '' });
  const [theme, setTheme] = useState('dark');
  const [toast, setToast] = useState(null);
  const lastEventsRef = useRef([]);

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isThreat = (event) => {
    return event.status === 'High Confidence' || ['drone', 'explosion', 'missile'].includes(event.type);
  };

  const getToastBg = (status) => {
    if (status === 'High Confidence') return 'bg-danger';
    if (status === 'Developing') return 'bg-warning text-dark';
    return 'bg-secondary';
  };

  const showToast = (event) => {
    setToast({
      status: event.status,
      credibility: event.credibilityScore,
      time: new Date(event.timestamp).toLocaleTimeString(),
      id: event._id
    });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/events');
      const newEvents = res.data;
      // Find new events
      const previousIds = lastEventsRef.current.map(e => e._id);
      const addedEvents = newEvents.filter(event => !previousIds.includes(event._id));
      addedEvents.forEach(event => {
        showToast(event);
      });
      lastEventsRef.current = newEvents;
      setEvents(newEvents);
    } catch (err) {
      console.error(err);
    }
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case 'Unverified': return 'grey';
      case 'Developing': return 'orange';
      case 'High Confidence': return 'red';
      default: return 'blue';
    }
  };

  const simulateReport = async () => {
    const fakeReport = {
      text: 'Explosion reported near location',
      username: 'user123',
      followerCount: 1000,
      verified: true,
      latitude: 32.5 + (Math.random() - 0.5) * 0.1,
      longitude: 74.5 + (Math.random() - 0.5) * 0.1,
      timestamp: new Date().toISOString()
    };
    try {
      await axios.post('http://localhost:5001/api/report', fakeReport);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filters.type && event.type !== filters.type) return false;
    if (filters.status && event.status !== filters.status) return false;
    if (filters.date && !event.timestamp.startsWith(filters.date)) return false;
    return true;
  });

  return (
    <>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1"><img src="/logo-removebg-preview.png" alt="Logo" height="30" /></span>
          <button className="btn btn-outline-secondary" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </nav>

      {toast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className={`toast show ${getToastBg(toast.status)}`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <strong className="me-auto">{toast.status}</strong>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setToast(null)}></button>
            </div>
            <div className="toast-body">
              <div>Credibility: {toast.credibility}%</div>
              <div className="text-muted small">{toast.time}</div>
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid d-flex" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="col-8 p-0">
        <MapContainer center={[32.5, 74.5]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredEvents.map(event => (
            <Marker
              key={event._id}
              position={[event.latitude, event.longitude]}
              eventHandlers={{
                click: () => setSelectedEvent(event)
              }}
            >
              <Popup>
                <div>
                  <h5>{event.type}</h5>
                  <p>{event.description}</p>
                  <p><strong>Credibility:</strong> {event.credibilityScore}</p>
                  <p><strong>Reports:</strong> {event.reportCount}</p>
                  <p><strong>Status:</strong> {event.status}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
        <div className="col-4 p-3 bg-body overflow-auto">
        <h2 className="mb-3">Event Feed</h2>
        <div className="mb-3">
          <label className="form-label">Filter by Type</label>
          <select className="form-select" onChange={(e) => setFilters({...filters, type: e.target.value})}>
            <option value="">All Types</option>
            <option value="drone">Drone</option>
            <option value="explosion">Explosion</option>
            <option value="missile">Missile</option>
            <option value="conflict">Conflict</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Filter by Status</label>
          <select className="form-select" onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="">All Status</option>
            <option value="Unverified">Unverified</option>
            <option value="Developing">Developing</option>
            <option value="High Confidence">High Confidence</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Filter by Date</label>
          <input type="date" className="form-control" onChange={(e) => setFilters({...filters, date: e.target.value})} />
        </div>
        <button className="btn btn-primary mb-3" onClick={simulateReport}>Simulate Report</button>
        {selectedEvent && (
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">{selectedEvent.type}</h5>
              <p className="card-text">{selectedEvent.description}</p>
              <p className="card-text"><strong>Credibility:</strong> {selectedEvent.credibilityScore}</p>
              <p className="card-text"><strong>Reports:</strong> {selectedEvent.reportCount}</p>
              <p className="card-text"><strong>Status:</strong> {selectedEvent.status}</p>
              <p className="card-text"><small className="text-muted">Time: {new Date(selectedEvent.timestamp).toLocaleString()}</small></p>
            </div>
          </div>
        )}
        <ul className="list-group">
          {filteredEvents.map(event => (
            <li key={event._id} className="list-group-item list-group-item-action" onClick={() => setSelectedEvent(event)}>
              {event.type} - {event.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
}

export default App;