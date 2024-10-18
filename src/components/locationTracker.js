import React, { useState, useRef } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationArrow, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import './LocationTracker.css';

const mapContainerStyle = {
  height: "500px",
  width: "100%",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  marginBottom: "20px",
};

const LocationTracker = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false); 
  const mapRef = useRef(null);  

  const GOOGLE_MAPS_API_KEY = "AIzaSyCNWWiQM-G6gjoIblfIK0vuc3ldBmWfJk8";

  const storeCurrentLocationInFirebase = async (latitude, longitude) => {
    try {
      await addDoc(collection(db, "currentLocations"), {
        latitude,
        longitude,
        timestamp: new Date(),
      });
      alert("Current location stored successfully!");
    } catch (err) {
      setError("Failed to store current location.");
    }
  };

  const storeLiveLocationInFirebase = async (latitude, longitude) => {
    try {
      await addDoc(collection(db, "liveLocations"), {
        latitude,
        longitude,
        timestamp: new Date(),
      });
    } catch (err) {
      setError("Failed to store live location.");
    }
  };

  const centerMap = (latitude, longitude) => {
    if (mapRef.current && window.google && window.google.maps) {
      mapRef.current.panTo({ lat: latitude, lng: longitude });
    }
  };


  const handleCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          storeCurrentLocationInFirebase(latitude, longitude);
          setLoading(false);
          setIsMapVisible(true);  
          centerMap(latitude, longitude); 
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Failed to retrieve current location.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

 
  const handleStartLiveTracking = () => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation((prevLocation) => {
            if (prevLocation.latitude !== latitude || prevLocation.longitude !== longitude) {
              storeLiveLocationInFirebase(latitude, longitude);
              centerMap(latitude, longitude); 
              setIsMapVisible(true);  
              return { latitude, longitude };
            }
            return prevLocation;
          });
        },
        (err) => {
          console.error("Live tracking error:", err);
          setError("Failed to track live location.");
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
      setWatchId(id);
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  
  const handleStopLiveTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      alert("Live location tracking stopped.");
    }
  };

  return (
    <div className="location-tracker-container">
      <h2 className="title">Location Tracker</h2>

      <div className="fab-container">
        <button onClick={handleCurrentLocation} className="fab primary-fab" title="Share Current Location">
          <FontAwesomeIcon icon={faLocationArrow} />
        </button>

        <button onClick={handleStartLiveTracking} className="fab secondary-fab" disabled={watchId !== null} title="Start Live Sharing">
          <FontAwesomeIcon icon={faPlay} />
        </button>

        <button onClick={handleStopLiveTracking} className="fab danger-fab" disabled={watchId === null} title="Stop Live Sharing">
          <FontAwesomeIcon icon={faStop} />
        </button>
      </div>

      {isMapVisible && (
        <div className="map-container">
          {loading ? (
            <div className="loading-spinner">Locating...</div>
          ) : location.latitude !== null && location.longitude !== null ? (
            <>
              <p className="coords">
                <FontAwesomeIcon icon={faLocationArrow} /> Latitude: {location.latitude}
              </p>
              <p className="coords">Longitude: {location.longitude}</p>

              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={{ lat: location.latitude, lng: location.longitude }}
                  zoom={17}
                  ref={mapRef}  
                >
                  {window.google && window.google.maps && (
                    <Marker
                      position={{ lat: location.latitude, lng: location.longitude }}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",  
                        scaledSize: new window.google.maps.Size(40, 40),  
                      }}
                    />
                  )}
                </GoogleMap>
              </LoadScript>
            </>
          ) : (
            <p className="error-message">Waiting for location...</p>
          )}
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default LocationTracker;
