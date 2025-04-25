import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, FeatureGroup, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Styles.css";
import useGeoLocation from "../utils/useGeoLocation";
import { EditControl } from "react-leaflet-draw";
import L from 'leaflet';
import LeafletGeoCoder from "./LeafletGeoCoder";
import { ScaleControl } from 'react-leaflet';
import Legend from "./Legend";
import { Row } from "shards-react";

const SatteliteMap = ({
  data,
  selectedImageUrl,
  renderImageGallery
}) => {
  const location = useGeoLocation();
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [mapCenter, setMapCenter] = useState([36.806389, 10.181667]);
  const [zoomLevel,setZoomLevel] = useState(10);
  const mapRef = useRef(null);
  const imageOverlayRef = useRef(null);
  const [bounds, setBounds] = useState(null);
  // Initialize map with field data
  useEffect(() => {
    if (data && data.length > 0 && data[0]) {
      const field = data[0];
      const latitude = Number(field.Latitude);
      const longitude = Number(field.Longitude);
      
      // Set marker position
      setMarkers([latitude, longitude]);
      setMapCenter([latitude, longitude]);
      
      // Parse and set polygon coordinates
      try {
        if (field.coordinates) {
          const parsedCoords = JSON.parse(field.coordinates);
          
          // Ensure that parsedCoords is an array of objects like [{Lat: xx, Long: xx}, ...]
          if (Array.isArray(parsedCoords)) {
            const formattedCoords = parsedCoords.map(coord => {
              return [coord.Lat, coord.Long]; // Ensure [Lat, Long] format for Leaflet
            });
            
            setPolygonCoords(formattedCoords); // Set the coordinates state
            calculateImageBounds(formattedCoords); // Calculate the bounds based on the coordinates
          }
        }
      } catch (e) {
        console.error("Error parsing coordinates:", e);
      }
    }
  }, [data]);
  

  // Handle selected image URL changes
  useEffect(() => {
    if (selectedImageUrl && bounds && mapRef.current) {
      // Remove previous overlay if exists
      if (imageOverlayRef.current) {
        imageOverlayRef.current.remove();
      }
      
      // Create new image overlay
      imageOverlayRef.current = L.imageOverlay(selectedImageUrl, bounds, {
        opacity: 1,
        interactive: true,
      }).addTo(mapRef.current);
      
      // Fit bounds to show the entire image
      mapRef.current.fitBounds(bounds);
    }
    
    return () => {
      if (imageOverlayRef.current) {
        imageOverlayRef.current.remove();
      }
    };
  }, [selectedImageUrl, bounds]);

  // Calculate bounds from polygon coordinates
// Calculate bounds from polygon coordinates
const calculateImageBounds = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return;
  
  const lats = coordinates.map(coord => coord[0]);
  const lngs = coordinates.map(coord => coord[1]);
  
  const newBounds = [
    [Math.min(...lats), Math.min(...lngs)], // South West corner
    [Math.max(...lats), Math.max(...lngs)]  // North East corner
  ];
  
  setBounds(newBounds); // Update the bounds state
};

const getCenterFromField = () => {
  if (data && data.length > 0) {
    const firstField = data[0];
    return [Number(firstField.Latitude), Number(firstField.Longitude)];
  }
  return null;
};
useEffect(() => {
  const updateMapCenter = async () => {
    const centerFromFields = getCenterFromField();
    if (centerFromFields) {
      setMapCenter(centerFromFields);
      setZoomLevel(17)
      mapRef.current.setView(centerFromFields, zoomLevel);
    }
  };

  updateMapCenter();
}, [data, mapRef, zoomLevel]);


  return (
    <div>
      <MapContainer 
        ref={mapRef}
        style={{ borderRadius: 20, boxShadow: '1px 1px 10px #bbb', height: 300 }}
        className="markercluster-map"
        zoom={zoomLevel}
        center={mapCenter}
        whenCreated={(map) => {
          mapRef.current = map;
        }}
      >
        <FeatureGroup>
          <ScaleControl position="bottomleft" />
        </FeatureGroup>
        
        <TileLayer
          maxNativeZoom={18}
          maxZoom={20}
          url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        />
        
        <Legend map={mapRef.current} />
        <LeafletGeoCoder />

        {location.loaded && !location.error && (
          <Marker position={[location.coordinates.lat, location.coordinates.lng]}>
            <Popup>My position</Popup>
          </Marker>
        )}
        
        {markers.length > 0 && data && data[0] && (
          <Marker position={[markers[0], markers[1]]}>
            <Popup>{data[0].title}</Popup>
          </Marker>
        )}
        
        {polygonCoords.length > 0 && (
          <Polygon
            pathOptions={{ color: '#26A6B7', opacity: 0.2 }}
            positions={polygonCoords}
            fillColor="none"
          />
        )}
      </MapContainer>
      <Row style={{marginTop: "20px",marginRight: "0px",marginLeft: "0px" }}>
        {renderImageGallery()}
      </Row>

    </div>
  );
};

export default SatteliteMap;