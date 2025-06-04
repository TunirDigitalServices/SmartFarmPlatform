import { useEffect } from 'react';
import L from 'leaflet';
import { useTranslation } from "react-i18next";

const legends = {
  NDVI: {
    key: 'NDVI',
    gradient: 'linear-gradient(to top, #000000, #8c8c8c, #b6ff00, #4aff00, #009600)',
    labels: ['1', '0.4', '0.2', '0', '-1'],
    titleKey: 'ndvititle',
    descriptionKey: 'ndvidescription',
  },
  MOISTURE: {
    key: 'MOISTURE',
    gradient: 'linear-gradient(to top, #ff0000, #ffaa7f, #ffffff, #aaffff, #0000ff)',
    labels: ['0.8', '0.24', '0', '-0.24', '-0.8'],
    titleKey: 'moisturetitle',
    descriptionKey: 'moisturedescription',
  },
  NDWI: {
    key: 'NDWI',
    gradient: 'linear-gradient(to bottom, #004cff, #66b2ff, #ffffff, #66ff66, #00cc00)',
    labels: ['0.8', '0.5', '0', '-0.2', '-0.8'],
    titleKey: 'ndwititle',
    descriptionKey: 'ndwidescription',
  },
};

const Legend = ({ map, selectedType }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const normalizedType = selectedType?.toUpperCase();
    if (!map || !legends[normalizedType]) return;

    const { titleKey, gradient, labels, descriptionKey } = legends[normalizedType];

    const legendControl = L.control({ position: 'bottomright' });

    legendControl.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = `
        <div style="
          background: white;
          padding: 10px;
          border-radius: 6px;
          box-shadow: 0 0 8px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: row;
          align-items: center;
          font-family: sans-serif;
        ">
          <div style="
            height: 120px;
            width: 20px;
            background: ${gradient};
            border: 1px solid #ccc;
            margin-right: 8px;">
          </div>

          <div style="display: flex; flex-direction: column; justify-content: space-between; height: 120px; font-size: 12px;">
            ${labels.map(label => `<span>${label}</span>`).join('')}
          </div>
        </div>
        <div style="font-size: 10px; padding: 5px; max-width: 180px; line-height: 1.4;">
    
          ${t(descriptionKey)}
        </div>
      `;
      return div;
    };

    legendControl.addTo(map);

    return () => {
      map.removeControl(legendControl);
    };
  }, [map, selectedType, t]);

  return null;
};

export default Legend;
