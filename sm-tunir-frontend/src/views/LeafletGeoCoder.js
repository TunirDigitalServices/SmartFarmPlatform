import React , {useEffect} from 'react'
import { useMap } from "react-leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import L from "leaflet";

const LeafletGeoCoder = () => {
    const map = useMap();
    useEffect(() => {
      L.Control.geocoder({
        defaultMarkGeocode: false,
      })
        .on("markgeocode", function (e) {
        console.log(e)
              var latlng = e.geocode.center;
          L.marker(latlng).addTo(map).bindPopup(e.geocode.name).openPopup();
          map.fitBounds(e.geocode.bbox);
        })
        .addTo(map);
    }, []);
    return null;
}

export default LeafletGeoCoder