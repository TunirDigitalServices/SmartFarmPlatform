import L from "leaflet";
import { useEffect } from "react";

function Legend({ map, min, max }) {
  useEffect(() => {
    if (map) {
      // Remove existing legend if it exists
      const existingLegend = document.querySelector(".info.legend");
      if (existingLegend) {
        existingLegend.parentNode.removeChild(existingLegend);
      }

      const legend = L.control({ position: "bottomright" });

      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend");
        const gradient = createGradient(min, max);
        div.innerHTML = `
          <div class="gradient" style="${gradient}"></div>
          <b>Min:</b> ${min}<br>
          <b>Max:</b> ${max}
        `;
        return div;
      };

      legend.addTo(map);
    }
  }, [map, min, max]);

  return null;
}

// Create a gradient style string
function createGradient(min, max) {
  const percentage = (value) => ((value - min) / (max - min)) * 100;
  const gradient = `
    background: linear-gradient(90deg, rgba(45,245,41,1) ${percentage(min)}%, rgba(223,186,29,1) 54%, rgba(201,37,37,1) ${percentage(max)}%);
    height: 10px;
    width:100%;
    border-radius:12px;
  `;
  return gradient;
}

export default Legend;
