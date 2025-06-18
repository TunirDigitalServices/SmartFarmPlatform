import moment from "moment";
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

const DashboardChart = ({ data }) => {
  console.log(data);
  const [state, setState] = useState(null);
  const { t, i18n } = useTranslation();

  const getChartData = () => {
    let labels = [];
    let dataBilan = [];
    for (let i = 0; i <= data.length; i++) {
      if (data[i] && data[i].dates) {
        let allDate = data[i].dates;
        let date = moment(allDate).locale("En").format("MMM DD");
        labels.push(date);
        dataBilan.push(parseFloat(data[i].bilan).toFixed(2));
      }
    }
    const state = {
      labels: labels,
      datasets: [
        {
          label: `${t("water_balance")}`,
          fill: false,
          lineTension: 0.5,
          backgroundColor: "rgba(75,192,192,1)",
          borderColor: "#27A6B7",
          borderWidth: 2,
          data: dataBilan,
        },
      ],
    };
    setState(state);
  };

  useEffect(() => {
    getChartData();
  }, [data]);

  return (
    <>
    {state && <Line
      data={state}
      options={{
        plugins: {
          title: {
            display: true,
            text: `${t("water_balance")}`,
            font: {
              size: 20,
            },
          },
          legend: {
            display: true,
            position: "right",
          },
        },
        scales: {
          x: {
            ticks: {
              padding: 2,
            },
          },
        },
      }}
    />}
    </>
  );
};

export default DashboardChart;
