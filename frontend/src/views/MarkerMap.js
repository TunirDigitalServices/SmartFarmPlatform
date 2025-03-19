import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { Button } from 'shards-react'
import api from '../api/api';
import L from 'leaflet';

export default function Markerwhatever(props) {
  const [draggable, setDraggable] = useState(false)
  const [position, setPosition] = useState({lat:props.lat, lng:props.long})
  const markerRef = useRef(null)


  const map = useMap();
  let center = props.center
  if(typeof center !== "undefined" && center.length > 0 && props.fromAction === true)
    map.setView(center, props.zoom);
      
  
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
        }
      },
      click: (e) => {
        map.flyTo(e.latlng, 9);
      }
    }),
    [],
  )
  const toggleDraggable = useCallback(() => {
    setDraggable((d) => !d)
  }, [])

  const savePosition = async() => {
    let Latitude = position.lat
    let Longitude = position.lng
    let idFarm = props.id
    await api.post('/farm/set-farm-position', { idFarm, Latitude ,Longitude })
      .then(res => {
        console.log(res)
      }).catch((error)=>{
        console.log(error)
      })
    setDraggable(false)
  }
  const Iconsensor = new L.Icon({
    iconUrl: require('../images/smartfarm_capteur.png'),
    iconSize: [48, 52],
    iconAnchor: [17, 45],
    popupAnchor: [3, -46]
  })
  return (
    <div>
      <Marker
        eventHandlers={eventHandlers}
        draggable={draggable}
        position={position}
        ref={markerRef}
        icon={Iconsensor}
      >
      <Popup>
      {draggable ?
        <i onClick={savePosition} class="fa fa-check mx-2" title='save position'></i>
        : <i  onClick={toggleDraggable} className="material-icons" title='edit position'>&#xe3c9;</i> 
        }
        
        <div>
        {props.name}
        </div>
      </Popup>
      
      </Marker>
    </div>
  );
}