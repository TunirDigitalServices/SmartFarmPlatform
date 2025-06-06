import React, { Component } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  FeatureGroup,
  Polygon
} from "react-leaflet";
import L, { polygon } from "leaflet";
import { EditControl } from "react-leaflet-draw";

// work around broken icons when using webpack, see https://github.com/PaulLeCam/react-leaflet/issues/255

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-shadow.png"
});

let polyline;

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drawPolicy: {
        polygon: true,
        circle: true,
        rectangle: true,
        polyline: true,
        marker: false,
        circlemarker: false
      },
      leaflet: null,
      editPolicy: {
        delete: true,
        edit: true
      }
    };
  }
  _onEdited = e => {
    let numEdited = 0;
    e.layers.eachLayer(layer => {
      numEdited += 1;
    });
    console.log(`_onEdited: edited ${numEdited} layers`, e);
    console.log(e.layers._layers[0]);

    this._onChange();
  };

  _onCreated = e => {
    let type = e.layerType;
    let layer = e.layer;
    if (type === "marker") {
      // Do marker specific actions
      console.log("_onCreated: marker created", e);
    } else {
      console.log("_onCreated: something else created:", type, e);
      console.log(e.layer._latlngs[0]);
    }
    // Do whatever else you need to. (save to db; etc)

    this._onChange();
  };

  _onDeleted = e => {
    let numDeleted = 0;
    e.layers.eachLayer(layer => {
      numDeleted += 1;
    });
    console.log(`onDeleted: removed ${numDeleted} layers`, e);

    this._onChange();
  };

  _onMounted = drawControl => {
    console.log("_onMounted", drawControl);
  };

  _onEditStart = e => {
    console.log("_onEditStart", e);
  };

  _onEditStop = e => {
    console.log("_onEditStop", e);
  };

  _onDeleteStart = e => {
    console.log("_onDeleteStart", e);
  };

  _onDeleteStop = e => {
    console.log("_onDeleteStop", e);
  };

  _onDrawVertex = e => {
    console.log("vertex drawn", e);
    var leafletId = e.layers._leaflet_id;
    console.log(leafletId);
    console.log(e.layers._layers[2]);
  };

  componentDidMount() {
    const fetchData = async () => {
      const response = await fetch(`http://127.0.0.1:9000/getShape`);
      const newData = await response.json();

      f.push(
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: newData.coordinates
          }
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [130, 50]
          }
        }
      );
      let leafletGeoJSON = new L.GeoJSON(getGeoJson());
      let leafletFG = this.state.leaflet;

      leafletGeoJSON.eachLayer(layer => {
        leafletFG.addLayer(layer);
      });
    };

    //fetchData();

    if (this.props.type == "edit") {
      this.setState({
        ...this.state,
        drawPolicy: {
          polygon: true,
          circle: false,
          rectangle: false,
          polyline: true,
          marker: false,
          circlemarker: false
        }
      });
    }

    if (this.props.draw == false) {
      this.setState({
        ...this.state,
        drawPolicy: {
          polygon: false,
          circle: false,
          rectangle: false,
          polyline: false,
          marker: false,
          circlemarker: false
        }
      });
    }

    if (this.props.edit == false) {
      this.setState({
        ...this.state,
        editPolicy: {
          remove: false,
          edit: false
        }
      });
    }
  }

  render() {
    return (
      <div
        style={{
          width: "100%",
          height: 300,
          overflow: "hidden"
        }}
      >
        <MapContainer
          center={[37.8189, -122.4786]}
          zoom={13}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          />
          <FeatureGroup
            ref={reactFGref => {
              this._onFeatureGroupReady(reactFGref);
            }}
          >
            <EditControl
              position="topleft"
              //onEdited={this._onEdited}
              onEdited={e => {
                e.layers.eachLayer(a => {
                  console.log(a.toGeoJSON());
                });
              }}
              onCreated={this._onCreated}
              onDeleted={this._onDeleted}
              onMounted={this._onMounted}
              //onEditStart={this._onEditStart}
              onEditStop={this._onEditStop}
              onDeleteStart={this._onDeleteStart}
              onDeleteStop={this._onDeleteStop}
              onDrawVertex={this._onDrawVertex}
              draw={this.state.drawPolicy}
              edit={this.state.editPolicy}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
    );
  }

  _editableFG = null;

  _onFeatureGroupReady = reactFGref => {
    // populate the leaflet FeatureGroup with the geoJson layers

    let leafletGeoJSON = new L.GeoJSON(getGeoJson());
    let leafletFG = reactFGref;
    this.state.leaflet = reactFGref;

    leafletGeoJSON.eachLayer(layer => {
      //leafletFG.addLayer(layer);
    });

    //map.eachLayer(function (layer) {
    // map.removeLayer(layer);
    //})

    // store the ref for future access to content

    this._editableFG = reactFGref;
  };

  _onChange = () => {
    // this._editableFG contains the edited geometry, which can be manipulated through the leaflet API

    const { onChange } = this.props;

    if (!this._editableFG || !onChange) {
      return;
    }

    const geojsonData = this._editableFG.toGeoJSON();
    onChange(geojsonData);
    console.log(geojsonData);
  };
}

// data taken from the example in https://github.com/PaulLeCam/react-leaflet/issues/176

var f = [
  {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [-122.47979164123535, 37.830124319877235],
        [-122.47721672058105, 37.809377088502615]
      ]
    }
  },
  {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: [-122.46923446655273, 37.80293476836673]
    }
  },
  {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: [-122.48399734497069, 37.83466623607849]
    }
  },
  {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: [-122.47867584228514, 37.81893781173967]
    }
  },
  {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-122.48069286346434, 37.800637436707525],
          [-122.48069286346434, 37.803104310307276],
          [-122.47950196266174, 37.803104310307276],
          [-122.47950196266174, 37.800637436707525],
          [-122.48069286346434, 37.800637436707525]
        ]
      ]
    }
  },
  {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-122.48103886842728, 37.833075326166274],
          [-122.48065531253813, 37.832558431940114],
          [-122.4799284338951, 37.8322660885204],
          [-122.47963070869446, 37.83231693093747],
          [-122.47948586940764, 37.832467339549524],
          [-122.47945636510849, 37.83273426112019],
          [-122.47959315776825, 37.83289737938241],
          [-122.48004108667372, 37.833109220743104],
          [-122.48058557510376, 37.83328293020496],
          [-122.48080283403395, 37.83332529830436],
          [-122.48091548681259, 37.83322785163939],
          [-122.48103886842728, 37.833075326166274]
        ]
      ]
    }
  },
  {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-122.48043537139893, 37.82564992009924],
          [-122.48129367828368, 37.82629397920697],
          [-122.48240947723389, 37.82544653184479],
          [-122.48373985290527, 37.82632787689904],
          [-122.48425483703613, 37.82680244295304],
          [-122.48605728149415, 37.82639567223645],
          [-122.4898338317871, 37.82663295542695],
          [-122.4930953979492, 37.82415839321614],
          [-122.49700069427489, 37.821887146654376],
          [-122.4991464614868, 37.82171764783966],
          [-122.49850273132326, 37.81798857543524],
          [-122.50923156738281, 37.82090404811055],
          [-122.51232147216798, 37.823344820392535],
          [-122.50150680541992, 37.8271414168374],
          [-122.48743057250977, 37.83093781796035],
          [-122.48313903808594, 37.82822612280363],
          [-122.48043537139893, 37.82564992009924]
        ]
      ]
    }
  }
];
function getGeoJson() {
  return {
    type: "FeatureCollection",
    features: f
  };
}
