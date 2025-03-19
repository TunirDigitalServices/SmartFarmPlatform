// Import necessary libraries and components
import { MapContainer, TileLayer } from "react-leaflet";
import EditableMap from "./EditableMap";

// Main component
const MainComponent = () => {
  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
      />
      <EditableMap />
    </MapContainer>
  );
};

export default MainComponent;
