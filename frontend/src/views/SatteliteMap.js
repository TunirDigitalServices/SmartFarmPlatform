import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Circle, FeatureGroup, Marker, Popup, useMap, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Styles.css";
import useGeoLocation from "../utils/useGeoLocation";
import { EditControl } from "react-leaflet-draw";
import api from "../api/api";
import L from 'leaflet';
import MarkerObject from "./MarkerMap"
import LeafletGeoCoder from "./LeafletGeoCoder";
import axios from "axios";
import {  Card, CardBody, CardImg, CardTitle, Col, FormSelect, Row } from "shards-react";
import IrrigationMap from '../images/Irrigation-index.png'
import ndvi from '../images/ndvi.png'
import NitrogenMap from '../images/Nitrogen-Map.png'
import PlantHealthMap from '../images/Plant-Health-gci.png'
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import { Box } from "@mui/material";

import { ScaleControl } from 'react-leaflet' 
import Legend from "./Legend";

const SatteliteMap = ({farms, data, selectedData, _onEdited, draw, edit,drawn ,satellitesImages}) => {
  const position = [33.8921, 9.5615];
  const location = useGeoLocation();
  //   const map = useMap();
  const [overlayBounds, setOverlayBounds] = useState(null);
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [designationData, setDesignationData] = useState([]);
  const [selectedDesignationUrl, setSelectedDesignationUrl] = useState(null);
  const [Map, setMap] = useState(null)
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState([33.8921, 9.5615]); 
  const [min, setMin] = useState('-');
  const [max, setMax] = useState('-');

  const designationImageMap = {
    "Vegetation index": ndvi,
    "Irrigation index": IrrigationMap,
    "Nitrogen Map": NitrogenMap,
    "Plant Health": PlantHealthMap,
  };
  useEffect(() => {
    if (data && data.length > 0) {
      const { Latitude, Longitude } = data[0];
      setCenter([Number(Latitude), Number(Longitude)]);
      setMarkers([Number(Latitude), Number(Longitude)]);
      
    }
  }, [data]);
  useEffect(() => {
    if( data.length > 0) {
      let coordinates = []
      data.map(field=>{
        let coord = JSON.parse(field.coordinates)
        if (coord) {
          coord.map(co => {
            coordinates.push(Object.values(co))
          })
        }
      })
      setDrawnPolygon(coordinates)
    }
  }, [data])
  const calculateBounds = (coordinates) => {
    const latitudes = coordinates.map(coord => coord[1]);
    const longitudes = coordinates.map(coord => coord[0]);

    const bounds = [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)]
    ];

    return bounds;
  };


  // const handleCreated = (e) => {
  //   const type = e.layerType;
  //   const layer = e.layer;

  //   if (type === 'polygon') {
  //     const coordinates = layer.getLatLngs()[0].map(coord => [coord.lng, coord.lat]);
  //     setDrawnPolygon(coordinates);
  //   }
  // };
  // const handleSendRequest = () => {
  //   setIsRequesting(true);
  // };
  const handleCardClick = (selected) => {
    handleDesignationChange({ target: { value: selected } });
  };
  const handleDesignationChange = (event) => {
    const selected = event.target.value;
    const { url , min , max } = designationData[0][selected];
    const bounds = calculateBounds(drawnPolygon);
    setSelectedDesignation(selected);
    setSelectedDesignationUrl(url);
    setOverlayBounds(bounds);
    setMin(parseFloat(min).toFixed(2));
    setMax(parseFloat(max).toFixed(2));
  };

  useEffect(() => {
    const dataArray = []
      satellitesImages.map(data=>{
        setDesignationData(data.data);
      })
       
  
  }, [data,satellitesImages]);
  // useEffect(() => {
  //   if (designationData.length > 0 && selectedData.length === 0) {
  //       const apiUrl = '/field/add-sattelite-images';
  //       let userUid = JSON.parse(localStorage.getItem('user')).id
  //       const { Id } = data[0];
    
  //       api.post(apiUrl, { data: designationData , field_id : Id , user_uid : userUid , polygon : drawnPolygon })
  //       .then((response) => {
  //         const fetchedData = response.data.imagesData
  //         console.log(fetchedData)
  //       })
  //       .catch((error) => {
  //         // Handle errors
  //         console.error('API error:', error);
  //       })
  //     } 
    

  // }, [designationData])
    console.log(designationData)

  const [mapCenter, setMapCenter] = useState([36.806389, 10.181667]);
  const [zoomLevel, setZoomLevel] = useState(10);
  const mapRef = useRef(null);

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
      <MapContainer ref={mapRef}
        style={{ borderRadius: 20, boxShadow: '1px 1px 10px #bbb', height: 300 }}
        className="markercluster-map"
        zoom={zoomLevel}
        center={mapCenter}
        // maxZoom={18}
        whenCreated={(map) => {
          mapRef.current = map; // Assign the map instance to mapRef.current
        }}
      >
        <FeatureGroup>
          <EditControl draw={draw} edit={edit} position="topright"  onEdited={_onEdited} />
          <ScaleControl position="bottomleft" />
        
        </FeatureGroup>
        <TileLayer
          maxNativeZoom={18}
          maxZoom={20}
          url={selectedDesignationUrl || 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'}
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        />
        <Legend map={mapRef.current} min={min} max={max} />

        <LeafletGeoCoder />

        {location.loaded && !location.error && (
          <Marker position={[location.coordinates.lat, location.coordinates.lng]}>
            <Popup>My position</Popup>
          </Marker>
        )}
         {markers.length > 0 && (
          <Marker position={[markers[0], markers[1]]}>
            <Popup>{data[0].title}</Popup>
          </Marker>
        )}
         {markers.length > 0 && (
          <Polygon
            pathOptions={{ color: '#26A6B7' , opacity: 0.5 }}
            positions={drawnPolygon}
            
          />
        )}
        {selectedDesignationUrl && overlayBounds && (
          <TileLayer
          maxNativeZoom={18}
          maxZoom={20}
          key={selectedDesignationUrl}
            url={selectedDesignationUrl}
          />
        )}
      </MapContainer>
      {/* <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <Button  variant="outlined" startIcon={<SatelliteAltIcon />} onClick={handleSendRequest} disabled={isRequesting || data.length === 0}>
          {isRequesting ? 'Sending Request...' : 'Satellite Images'}
        </Button>

      </div> */}
      {
        isRequesting ?     
    <Box sx={{ width: '100%', marginTop: "10px" }}>
        <LinearProgress />

    </Box>
     : 
         <Row style={{marginTop: "16px",marginRight: "0px",marginLeft: "0px" ,marginBottom: "10px" }}>
        {designationData.length > 0 &&
          Object.keys(designationData[0]).map((item, indx) =>{
            const data = designationData[0][item];
            return(
              <Col lg="3" md="6" sm="6" xs="6"  style={{padding: "0px" , display: 'flex',justifyContent: 'center', alignItems: 'center',flexWrap:"wrap"}}>
               <div className="m-4 p-0 " style={{ width: "70px", height: "100px", cursor: "pointer" }} onClick={() => handleCardClick(item)}>
          <div className="m-0 p-0">
            <h6 style={{ fontSize: "16px" ,fontWeight:'bold'  }} className="text-center py-2">{data.designation}</h6>
          </div>
          <img style={{borderRadius:50}} width={70} height={70} top src={designationImageMap[data.designation]} alt={item.designation} />
        </div>
              </Col>
           )
            
          }
         )}
      </Row>
      }
    
    </div>
  );
};

export default SatteliteMap;