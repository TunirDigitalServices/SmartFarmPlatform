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


const LeafletMap = ({ type, data, _onCreated, _onEdited, draw, edit, sensor, farms, fields, zoom, center, fromAction, uid }) => {


  const mapRef = useRef();
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
  useEffect(() => {
    const updateMapCenter = async () => {
      console.log("updatercentermap working");

      const centerFromSensors = getCenterFromSensors();
      if (centerFromSensors) {
        setMapCenter(centerFromSensors);
        setZoomLevel(16.5)
        console.log(centerFromSensors, "centerFromSensors");
        console.log(zoomLevel, "zoomLevel");
        console.log(mapRef.current, " mapRef.current");


        // mapRef.current.setView(centerFromSensors, zoomLevel);
      }
    };

    updateMapCenter();
  }, [sensor, mapRef, zoomLevel]);
  const location = useGeoLocation();

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
          let coordinates = []
          let fields = item.fields;
          let sensorsCoord = []
          // fields?.map(field => {
          //   let coord = JSON.parse(field?.coordinates)
          //   if (coord) {
          //     coord.map(co => {
          //       coordinates.push(Object.values(co))
          //     })
          //   }
          fields?.forEach(field => {
            if (field?.coordinates) {
              try {
                let coord = JSON.parse(field.coordinates);
                coord?.forEach(co => {
                  coordinates.push(Object.values(co));
                });
              } catch (error) {
                console.error("Invalid JSON in coordinates:", field.coordinates, error);
              }
            }
            let sensors = field?.sensors;
            if (sensors) {

              sensors.map(sensor => {
                if (sensor.Latitude && sensor.Longitude) {
                  sensorsCoord.push({
                    code: sensor.code,
                    Latitude: sensor.Latitude,
                    Longitude: sensor.Longitude
                  })

                }
              })
            }
          })


          return (
            <>
              <Polygon color="#28A6B7" key={indx} positions={coordinates}>
                {/* <MarkerObject key={indx} lat={item.Latitude} long={item.Longitude} name={item.name} id={item.id}></MarkerObject> */}
              </Polygon>
              {/* <Polygon key={indx} positions={coordinates}> */}

              {/* <Marker key={indx} position={[item.Latitude, item.Longitude]}>
                      <Popup>{item.name}</Popup>
                    </Marker> */}
              {/* </Polygon>  */}
              {

                sensor && sensor.map((sensors, indx) => {

                  if (sensors.Latitude && sensors.Longitude) {

                    return (
                      <Marker icon={Iconsensor} key={indx} position={[sensors.Latitude, sensors.Longitude]}>
                        <Popup >{sensors.code}</Popup>
                      </Marker>
                    )
                  }
                  // <MarkerObject key={indx} lat={sensors.Latitude} long={sensors.Longitude} name={sensors.code} id={sensors.id}></MarkerObject>



                }

                )

              }
            </>
          )



        })
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
        return data.map((item, indx) => {
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

  return (
    <div>
      <MapContainer
        style={{ borderRadius: 20, boxShadow: '1px 1px 10px #bbb', height: 300, zIndex: 1 }}
        className="markercluster-map"
        zoom={zoomLevel}
        center={mapCenter}
        maxZoom={18}
        whenCreated={(map) => {
          mapRef.current = map; // Assign the map instance to mapRef.current
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
        <LeafletGeoCoder />
        {location.loaded && !location.error && (
          <Marker icon={myIcon} position={[location.coordinates.lat, location.coordinates.lng]}>
            <Popup>My position</Popup>
          </Marker>
        )}
        {
          fromAction
            ?
            <SetViewOnClick center={center.length !== 0 ? center : centerDefault} zoom={zoom === "" ? zoomDefault : zoom} />
            :
            null
        }

        {returnedMap(L)}
        <MapViewUpdater center={mapCenter} zoom={16.5} />
      </MapContainer>
    </div>
  );
}

export default LeafletMap;
