import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Circle, FeatureGroup, Marker, Popup, useMap, Tooltip, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Styles.css";
import useGeoLocation from "../utils/useGeoLocation";
import { EditControl } from "react-leaflet-draw";
import api from "../api/api";
import L from 'leaflet';
import MarkerObject from "./MarkerMap"
import { useRef } from "react";
import LeafletGeoCoder from "./LeafletGeoCoder";
import icon from "../assets/images/icons/icon.png"
import sensor from "../assets/images/icons/sensor.png"
import positioning from "../assets/images/positioning.png"
const zoomDefault = 14;
let centerDefault = [36.806389, 10.181667];
const myIcon = new L.Icon({
  iconUrl: icon,
  iconSize: [40, 45],
  iconAnchor: [17, 45],
  popupAnchor: [3, -46]
})

const Iconsensor = new L.Icon({
  iconUrl: sensor,
  iconSize: [40, 42],
  iconAnchor: [17, 45],
  popupAnchor: [3, -46]
})
const NoSensorIcon = new L.Icon({
  iconUrl: positioning,
  iconSize: [40, 42],
  iconAnchor: [17, 45],
  popupAnchor: [3, -46]
});

let currentPage = window.location.pathname

const SetViewOnClick = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);

  return null;
}
const MapViewUpdater = ({ center, zoom }) => {
  const map = useMap();

  React.useEffect(() => {
    if (map && center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);

  return null;
};
const FitBounds = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      console.log("Fitting bounds:", bounds.toBBoxString());
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
};



const LeafletMap = ({ type, data, _onCreated, _onEdited, draw, edit, sensor, farms, fields, zoom, center, fromAction, uid }) => {


  const mapRef = useRef();
  const sensorFieldsPoints = [];
  const noSensorFieldsPoints = [];

  const [mapCenter, setMapCenter] = useState([36.806389, 10.181667]);
  const [zoomLevel, setZoomLevel] = useState(10);
  const getCenterFromSensors = () => {
    if (sensor && sensor.length > 0) {
      const firstSensor = sensor[0];
      if (firstSensor.Latitude && firstSensor.Longitude) {
        return [Number(firstSensor.Latitude), Number(firstSensor.Longitude)];

      }
    }
    return null;
  };
  const addPoints = (pointsArray, targetArray) => {
    pointsArray.forEach((pt) => {
      if (Array.isArray(pt) && pt.length === 2) {
        targetArray.push(pt);
      }
    });
  };


  useEffect(() => {
    const updateMapCenter = async () => {
      const centerFromSensors = getCenterFromSensors();
      if (centerFromSensors && centerFromSensors.length === 2 && centerFromSensors.every(coord => typeof coord === "number")) {
        setMapCenter(centerFromSensors);
        setZoomLevel(16.5);
      } else {
        setMapCenter([36.806389, 10.181667]); // default fallback
        setZoomLevel(10);
      }
    };

    updateMapCenter();
  }, [sensor, mapRef, zoomLevel]);
  const location = useGeoLocation();
  const getCentroid = (coords) => {
    const latSum = coords.reduce((sum, coord) => sum + coord[0], 0);
    const lngSum = coords.reduce((sum, coord) => sum + coord[1], 0);
    return [latSum / coords.length, lngSum / coords.length];
  };

  const returnedMap = (L) => {
    switch (currentPage) {
      case '/AddSensor':
        return farms.map((item, indx) => {
          let coordinates = []
          let coord = JSON.parse(item.coordinates)
          if (coord) {
            coord.map(co => {
              coordinates.push(Object.values(co))
            })
          }
          if (coord) {
            return <>
              <Polygon key={indx} positions={coordinates}> </Polygon>
              {
                data.map((item, indx) => {
                  if (item.Latitude && item.Longitude) {
                    return <MarkerObject key={indx} lat={item.Latitude} long={item.Longitude} name={item.code} id={item.id}></MarkerObject>



                  }
                })

              }
            </>

          }

        })
      case '/':
        return data.map((item, indx) => {
          const fields = item.fields;

          return (
            <React.Fragment key={indx}>
              {fields?.map((field, fieldIdx) => {
                let fieldCoordinates = [];
                const sensorsCoord = [];

                if (field?.coordinates) {
                  try {
                    const coord = JSON.parse(field.coordinates);
                    if (Array.isArray(coord) && coord.length > 0) {
                      fieldCoordinates = coord.map(co => [co.Lat, co.Long]);
                      if (field?.sensors && field.sensors.length > 0) {
                        addPoints(fieldCoordinates, sensorFieldsPoints);
                      } else {
                        addPoints(fieldCoordinates, noSensorFieldsPoints);
                      }
                    }

                  } catch (error) {
                    console.error("Invalid field coordinates", error);
                  }
                }
                if (field?.sensors && field.sensors.length > 0) {
                  field.sensors.forEach(sensor => {
                    if (sensor.Latitude && sensor.Longitude) {
                      sensorsCoord.push({
                        code: sensor.code,
                        Latitude: sensor.Latitude,
                        Longitude: sensor.Longitude,
                      });
                      addPoints([[sensor.Latitude, sensor.Longitude]], sensorFieldsPoints);
                    }
                  });
                }


                return (
                  <React.Fragment key={`${indx}-${fieldIdx}`}>
                    {fieldCoordinates.length > 2 && (
                      <Polygon
                        pathOptions={{ color: '#28A6B7', weight: 2, fillOpacity: 0.5 }}
                        positions={fieldCoordinates}
                      />
                    )}

                    {/* Show sensors if exist */}
                    {sensorsCoord.length > 0 ? (
                      sensorsCoord.map((sensor, sensorIdx) => (
                        <React.Fragment key={sensorIdx}>
                          <Marker
                            icon={Iconsensor}
                            position={[sensor.Latitude, sensor.Longitude]}
                          >
                            <Popup>{sensor.code}</Popup>
                          </Marker>
                          {/* <Circle
                            center={[sensor.Latitude, sensor.Longitude]}
                            radius={10}
                            pathOptions={{ color: 'blue', fillOpacity: 0.2 }}
                          /> */}
                        </React.Fragment>
                      ))
                    ) : (
                      // No sensors: show one marker on field center with different icon
                      fieldCoordinates.length > 0 && (
                        <Marker
                          icon={NoSensorIcon}
                          position={getCentroid(fieldCoordinates)} // use first coordinate as marker position (or calculate centroid)
                        >
                          <Popup>No Sensors in this field</Popup>
                        </Marker>
                      )
                    )}
                  </React.Fragment>
                );
              })}

            </React.Fragment>
          );
        });
      case '/Dashboard-supplier':

        return (
          <>
            {/* <Polygon key={indx} positions={coordinates}>
                
                      <Marker key={indx} position={[item.Latitude, item.Longitude]}>
                        <Popup>{item.name}</Popup>
                      </Marker>
                    </Polygon> */}
            {

              sensor.map((sensors, indx) => {
                return <MarkerObject key={indx} lat={sensors.Latitude} long={sensors.Longitude} name={sensors.code} id={sensors.id}></MarkerObject>

                //<Marker icon={Iconsensor} key={indx} position={[sensors.Latitude, sensors.Longitude]}>
                //   <Popup>{sensors.code}</Popup>
                // </Marker>


              }

              )

            }
          </>
        )


      case `/admin/user/${uid}/farms`:
        return data?.map((item, indx) => {
          let coordinates = []
          let coord = JSON.parse(item.coordinates)
          if (coord) {
            coord.map(co => {
              coordinates.push(Object.values(co))
            })
          }
          if (coord) {
            return <Polygon key={indx} positions={coordinates}>
              <MarkerObject key={indx} lat={item.Latitude} long={item.Longitude} name={item.name} id={item.id}></MarkerObject>
            </Polygon>
          } else {
            return <MarkerObject key={indx} lat={item.Latitude} long={item.Longitude} name={item.name} id={item.id} zoom={zoom} center={center} fromAction={fromAction}></MarkerObject>
          }


        })
      case `/admin/user/${uid}/fields`:
        return data.map((item, indx) => {
          let coordinates = []
          let coord = JSON.parse(item.coordinates)
          if (coord) {
            coord.map(co => {
              coordinates.push(Object.values(co))
            })
          }
          if (coord) {
            return (
              <>
                <Polygon key={indx} positions={coordinates}> </Polygon>

                {
                  fields && fields.map((item, indx) => {
                    if (item.Latitude) {
                      return (

                        <MarkerObject key={indx} lat={item.Latitude} long={item.Longitude} name={item.title} id={item.id}></MarkerObject>

                      )

                    }
                  })
                }
              </>

            )
          }

        })
      case `/admin/user/${uid}/sensors`:
        return farms && farms.map((item, indx) => {
          let coordinates = []
          let coord = JSON.parse(item.coordinates)
          if (coord) {
            coord.map(co => {
              coordinates.push(Object.values(co))
            })
          }
          if (coord) {
            return <>
              <Polygon key={indx} positions={coordinates}> </Polygon>
              {
                data.map((item, indx) => {
                  if (item.Latitude && item.Longitude) {
                    return <MarkerObject key={indx} lat={item.Latitude} long={item.Longitude} name={item.code} id={item.id}></MarkerObject>



                  }
                })

              }
            </>

          }

        })
    }
  }

  let userSensorCenter = getCenterFromSensors()

  console.log("sensorFieldsPoints", sensorFieldsPoints);
  console.log("noSensorFieldsPoints", noSensorFieldsPoints);
  return (
    <div>
      <MapContainer
        style={{ borderRadius: 20, boxShadow: '1px 1px 10px #bbb', height: 300, zIndex: 1 }}
        className="markercluster-map"
        center={mapCenter && mapCenter.length === 2 ? mapCenter : [36.806389, 10.181667]}
        zoom={zoom || 10}
        maxZoom={18}
        whenCreated={(map) => {
          mapRef.current = map;
        }}
      >
        <FeatureGroup>
          <EditControl draw={draw} edit={edit} position="topright" onCreated={_onCreated} onEdited={_onEdited} />
        </FeatureGroup>

        <TileLayer
          url='http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          attribution="© Google Maps"
        />

        {returnedMap(L)}

        {/* Fit the map bounds to include all polygons and sensors */}
        <FitBounds points={sensorFieldsPoints.length > 0 ? sensorFieldsPoints : noSensorFieldsPoints} />

      </MapContainer>
    </div>
  );
}

export default LeafletMap;
