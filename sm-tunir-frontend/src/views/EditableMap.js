import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw';
import { useMap } from "react-leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import LeafletGeoCoder from "./LeafletGeoCoder";

const EditableMap = ({ sensorsCoords, setCoords, setLayer }) => {
  useEffect(() => {
    // Check if sensorsCoords is not empty
    // if (!sensorsCoords || sensorsCoords.length === 0) return;
    let firstSensorLat = 36.25142
    let firstSensorLon = 10.25514
    let firstSensor = []
    // Extract the first sensor's coordinates
    if(sensorsCoords && sensorsCoords.length > 0){
      firstSensor = sensorsCoords[0];

    }
    if(Object.keys(firstSensor).length > 0){
      firstSensorLat = parseFloat(firstSensor.Latitude);
      firstSensorLon = parseFloat(firstSensor.Longitude);
      
    }
    // Create a Leaflet map
    const map = L.map('map').setView([firstSensorLat, firstSensorLon], 15);

    // Add a tile layer
    L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    // Create an editable feature group
    const editableLayers = new L.FeatureGroup().addTo(map);

    // Configure the drawing options
    const drawOptions = {
      position: 'topright',
      draw: {
        circle: false,
        marker: false,
        polyline: false,
        polygon: {
          allowIntersection: false,
          drawError: {
            color: 'red',
            timeout: 1000,
          },
          shapeOptions: {
            color: 'blue',
          },
        },
      },
    };

    // Add the Leaflet Draw control
    const drawControl = new L.Control.Draw(drawOptions);
    map.addControl(drawControl);

    // Add a marker for the first sensor
    L.marker([firstSensorLat, firstSensorLon])
      .addTo(map)
      .bindPopup("Sensor Location")
      .openPopup();

    // Event handler for layer creation
    map.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;

      // Access layer data (e.g., coordinates for polygons)
      const layerData = layer.toGeoJSON();

      // Update your application state with the layer data
      // Your logic to handle the layer data goes here
      let coordinates = [];
      if (layerData.geometry.type === 'Polygon') {
        coordinates = layerData.geometry.coordinates[0].map((coord) => ({
          Lat: coord[1],
          Long: coord[0],
        }));
      }
      if (coordinates.length > 0) {
        setLayer(JSON.stringify(coordinates));
        setCoords({ Latitude: coordinates[0].Lat, Longitude: coordinates[0].Long });
      }

      // Add the layer to the editableLayers FeatureGroup
      editableLayers.addLayer(layer);
    });

    // Add geocoder control
    L.Control.geocoder({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", function (e) {
        console.log(e);
        var latlng = e.geocode.center;
        L.marker(latlng)
          .addTo(map)
          .bindPopup(e.geocode.name)
          .openPopup();
        map.fitBounds(e.geocode.bbox);
      })
      .addTo(map);

    // Cleanup when the component is unmounted
    return () => {
      map.remove(); // Remove the map instance
    };
  }, [sensorsCoords, setCoords, setLayer]);

  return <div id="map" style={{ height: '400px' }}></div>;
};

export default EditableMap;
