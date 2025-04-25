import React from "react";
import axios from 'axios'
import PropTypes from "prop-types";
import { Row, Col, Card, CardHeader, CardBody, Button } from "shards-react";
import { withRouter } from "react-router-dom";
import moment from "moment";
import RangeDatePicker from "../common/RangeDatePicker";
import Plot from "../../utils/plot";
import api from '../../api/api';
let OverviewChart;
let chartData = {};

class Chart extends React.Component {
  constructor(props) {
    super();
    super(props);
    this.canvasRef = React.createRef();
    this.state = {
      dataSensorsElastic: [],
      temperatureData: [],
      pressureData: [],
      humidityData: [],
      humidityByDepthData: [],
      dateTimeSensor: [],
      humiditySensor: [],
      startDate: new Date(),
      endDate: new Date(),
      codes: [],
      dataChart: [],
      lengthData: [],
      titleFromApi: "",
      dataSensor : []
   
    }
  }
 

  componentWillReceiveProps = async (newProps, newState) => {
    var today = new Date();
     this.setState({ dataSensor: newProps.dataSensor })
    if (newProps.dataSensor) {
      await this.getDataToChart(newProps.dataSensor)
      // await this.filtreBydate(
      //   {
      //     startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), '00', '01', '00'),
      //     endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), '23', '59', '00')
      //   }
      //   , this.props.title, this.state.codes);
    }

    // They can still be triggered on hover.
    //const buoMeta = OverviewChart.getDatasetMeta(0);
    //buoMeta.data[0]._model.radius = 0;
    //buoMeta.data[chartData.datasets[0].data.length - 1]._model.radius = 0;

    // Render the chart.
  }

  getDataToChart = async (dataSensor) => {
    let elmTemperature = []
    let elmHumidity = []
    let elmPressure = []
    let elmHumidityMV = []
      let macId = ""
      let tmp = ""
      let hum = ""
      let press =""
      let humMV1 = ""
      let humMV2 = ""
      let humMV3 = ""
      let date = ''
      let dt = []
      console.log(dataSensor)
      if(dataSensor && dataSensor !== []){
        
        dataSensor.map(sensorData => {
          date = sensorData.time
          macId= sensorData.code
          elmTemperature =sensorData.temperature
          dt.push(moment(date.slice(0,10)).format('DD-MM-YYYY'))
          dt = ([...new Set(dt)])
        })
        // time =dataSensor.time[0]
        // humidity :data.humidity,
        // pressure :data.pressure,
        // charge :data.charge,
        // adc :data.adc,
        // ts :data.ts,
        // mv1 : data.mv1,
        // mv2 : data.mv2,
        // mv3 :data.mv3,
        // altitude :data.altitude
     //if dataSensor feha data
    //  let time = dataSensor.timeb[0]
      //  macId = dataSensor.mac_id[0]
      //  tmp = dataSensor.temperature[0]
      //  hum = dataSensor.humidity[0]
      //  press = parseFloat(dataSensor.Pressure[0])
      //  humMV1 = dataSensor.MV1[0]
      //  humMV2 = dataSensor.MV2[0]
      //  humMV3 = dataSensor.MV3[0]
      // dt = moment(date.slice(0,10)).format('DD-MM-YYYY');
      // elmTemperature= [tmp];
      // elmHumidity = [hum];
      // elmPressure = [press];
      // elmHumidityMV[20] = [humMV1]
      // elmHumidityMV[40] = [humMV2]
      // elmHumidityMV[60] = [humMV3]
      }
      //endif 

    await this.setState({temperatureData : elmTemperature})
    // await this.setState({pressureData : elmPressure})
    // await this.setState({humidityData : elmHumidity})
    // await this.setState({humidityByDepthData : elmHumidityMV})
    let backgroundColor = ["rgb(91, 239, 125)", "rgb(165, 188, 255)", "rgb(100, 200, 255)"]
    let borderColor = ["rgb(2, 107, 28)", "rgb(6, 45, 163)", "rgb(5, 20, 163)"]
    let elm = [];
    let data = [];
    if(this.props.title === "Temperature"){

      elm = {
        label: macId,
        fill: "start",
        data: this.state.temperatureData,
        backgroundColor: backgroundColor[0],
        borderColor: borderColor[0],
        pointBackgroundColor: "#22aa4f",
        pointHoverBackgroundColor: "rgb(0,123,255)",
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3
      }
      data.push(elm)
      
    }
    console.log(data)
// if(this.props.title === "Pressure"){

//     elm = {
//       label: macId,
//       fill: "start",
//       data: this.state.pressureData,
//       backgroundColor: backgroundColor[0],
//       borderColor: borderColor[0],
//       pointBackgroundColor: "#22aa4f",
//       pointHoverBackgroundColor: "rgb(0,123,255)",
//       borderWidth: 1.5,
//       pointRadius: 0,
//       pointHoverRadius: 3
//     }
//     data.push(elm)
// }
// if(this.props.title === "Humidity"){

//   elm = {
//     label: macId,
//     fill: "start",
//     data: this.state.humidityData,
//     backgroundColor: backgroundColor[0],
//     borderColor: borderColor[0],
//     pointBackgroundColor: "#22aa4f",
//     pointHoverBackgroundColor: "rgb(0,123,255)",
//     borderWidth: 1.5,
//     pointRadius: 0,
//     pointHoverRadius: 3
//   }
//   data.push(elm)
  
// }
// if(this.props.title === "Subsoil Humidity"){
//   let i = 0;
//     [20,40,60].map((item,indx) => {
//       elm = {
//         label: item,
//         fill: "start",
//         data: this.state.humidityByDepthData[item],
//         backgroundColor: backgroundColor[indx],
//         borderColor: borderColor[indx],
//         pointBackgroundColor: backgroundColor[indx],
//         pointHoverBackgroundColor:backgroundColor[indx],
//         borderWidth: 1.5,
//         pointRadius: 0,
//         pointHoverRadius: 3
//       }
//       data.push(elm)
//     })
// }
console.log(dt)
this.setState({ dataChart: data })
for (let index = 0; index < dt.length; index++) {
  chartData = {
  //add date
  labels: [dt[index]],
  datasets: this.state.dataChart
  
  };
  
}
  const chartOptions = {
    ...{
      responsive: true,
      legend: {
        position: "top",
        size :'14'
      },
      elements: {
        line: {
          // A higher value makes the line look skewed at this ratio.
          tension: 0.3
        },
        point: {
          radius: 0
        }
      },
      scales: {
        xAxes: [
          {
            gridLines: false,
            ticks: {
              padding: 10,
              autoSkip: false,
              //  maxRotation: 90,
              //  minRotation: 90,
            }
            // ticks: {
            //   callback(tick, index) {
            //     // Jump every 7 values on the X axis labels to avoid clutter.
            //     return index % 7 !== 0 ? "" : tick;
            //   }
            // }
          }
        ],
        yAxes: [
          {
            ticks: {
              suggestedMax: 45,
              callback(tick) {
                if (tick === 0) {
                  return tick;
                }
                // Format the amounts using Ks for thousands.
                return tick > 999 ? `${(tick / 1000).toFixed(1)}K` : tick;
              }
            }
          }
        ]
      },
      hover: {
        mode: "x-axis",
        intersect: false
      },
      tooltips: {
        custom: false,
        mode: "x-axis",
        intersect: false
      }
    },
    ...this.props.chartOptions
  };

  OverviewChart = new Plot(this.canvasRef.current, {
    type: "LineWithLine",
    data: chartData,
    options: chartOptions
  });

  console.log(OverviewChart)
  // OverviewChart.destroy();
  OverviewChart.update();
  }


  filtreBydate = async (value, title, codes) => {

    if (typeof OverviewChart !== "undefined") { OverviewChart.destroy(); }

    this.setState({ dataChart: [] })
    let startDate = value.startDate;
    let endDate = value.endDate;
    let data = [];
    let postData = {
      sensor_code: codes,
      startDate: startDate,
      endDate: endDate,
      title: title
    }
    if (startDate && endDate) {

          // let dataSensorsElastic = res.data.result
          // this.setState({ titleFromApi: res.data.title })

          // let elmTemperature = []
          // let elmHumidity = []
          // let lengthData = []
          // this.state.codes.map((co, i) => {
          //   let tmp = []
          //   let hum = []
          //   let dt = []
          //   let count = 0
          //   dataSensorsElastic.map((item, indx) => {
          //     if (co == item.code[0]) {
          //       count++;
          //       tmp.push(item.temperature)
          //       hum.push(item.humidity)
          //       dt.push(item.dateTime[0])
          //       elmTemperature[co] = { code: co, temparature: tmp, dateTime: dt };
          //       elmHumidity[co] = { code: co, humidity: hum, dateTime: dt };
          //       lengthData.push(count);
          //     }
          //   })
          // })
          // this.setState({ temperatureData: elmTemperature })
          // this.setState({ humiditySensor: elmHumidity })
          // lengthData = lengthData.filter((v, i, a) => a.indexOf(v) === i)
          // this.setState({ lengthData: lengthData })



      
      if (this.state.titleFromApi == "Humidity" && this.state.codes.length > 0) {
        chartData = {
          //add date
          labels: this.state.lengthData,
          datasets: this.state.dataChart

        };
      }
      if (this.state.titleFromApi == "Pressure" && this.state.codes.length > 0) {
        chartData = {
          //add date
          labels: this.state.lengthData,
          datasets: this.state.dataChart

        };
      }

      // if (this.state.titleFromApi == "Temperature" && this.state.codes.length > 0) {
      //   let elm = [];
      //   let tmparray = [];
      //   let dateTimearray = {}
      //   this.state.codes.map((item, indx) => {
      //     if (this.state.temperatureData[item]) tmparray = this.state.temperatureData[item].temparature
      //     if (this.state.temperatureData[item]) dateTimearray = this.state.temperatureData[item].dateTime

      //     elm = {
      //       label: item,
      //       fill: "start",
      //       data: tmparray,
      //       backgroundColor: backgroundColor[indx],
      //       borderColor: borderColor[indx],
      //       pointBackgroundColor: "#22aa4f",
      //       pointHoverBackgroundColor: "rgb(0,123,255)",
      //       borderWidth: 1.5,
      //       pointRadius: 0,
      //       pointHoverRadius: 3
      //     }
      //     data.push(elm)
      //     this.setState({ dataChart: data })
      //   })
      //   chartData = {
      //     //add date
      //     labels: this.state.lengthData,
      //     datasets: this.state.dataChart

      //   };
      // }
      // if (this.state.titleFromApi == "Humidity" && this.state.codes.length > 0) {
      //   let elm = [];
      //   let humidityarray = [];
      //   let dateTimearray = {}
      //   this.state.codes.map((item, indx) => {
      //     if (this.state.humiditySensor[item]) humidityarray = this.state.humiditySensor[item].humidity
      //     if (this.state.humiditySensor[item]) dateTimearray = this.state.humiditySensor[item].dateTime
      //     elm = {
      //       label: item,
      //       fill: "start",
      //       data: humidityarray,
      //       backgroundColor: backgroundColor[indx],
      //       borderColor: borderColor[indx],
      //       pointBackgroundColor: "#22aa4f",
      //       pointHoverBackgroundColor: "rgb(0,123,255)",
      //       borderWidth: 1.5,
      //       pointRadius: 0,
      //       pointHoverRadius: 3
      //     }
      //     data.push(elm)
      //     this.setState({ dataChart: data })
      //   })
      //   chartData = {
      //     //add date
      //     labels: this.state.lengthData,
      //     datasets: this.state.dataChart

      //   };
      // }
    }

    const chartOptions = {
      ...{
        responsive: true,
        legend: {
          position: "top",
        },
        elements: {
          line: {
            // A higher value makes the line look skewed at this ratio.
            tension: 0.3
          },
          point: {
            radius: 0
          }
        },
        scales: {
          xAxes: [
            {
              gridLines: false,
              /*ticks: {
                callback(tick, index) {
                  // Jump every 7 values on the X axis labels to avoid clutter.
                  return index % 7 !== 0 ? "" : tick;
                }
              }*/
            }
          ],
          yAxes: [
            {
              ticks: {
                suggestedMax: 45,
                callback(tick) {
                  if (tick === 0) {
                    return tick;
                  }
                  // Format the amounts using Ks for thousands.
                  return tick > 999 ? `${(tick / 1000).toFixed(1)}K` : tick;
                }
              }
            }
          ]
        },
        hover: {
          mode: "x-axis",
          intersect: false
        },
        tooltips: {
          custom: false,
          mode: "x-axis",
          intersect: false
        }
      },
      ...this.props.chartOptions
    };

    OverviewChart = new Plot(this.canvasRef.current, {
      type: "LineWithLine",
      data: chartData,
      options: chartOptions
    });
    // OverviewChart.destroy();
    OverviewChart.update();
  }
  ReportButton = () => {
    if (this.props.hasButton == true) {
      return (
        <Col>
          <Button
            onClick={() => this.props.history.push("/Graphs")}
            size="sm"
            className="d-flex btn-white ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0"
          >
            View Detailed Report
          </Button>
        </Col>
      );
    }
  };

  goToSelctedChart = (title) => {
    this.props.history.push(`/Graphs/${title}`);
    window.location.reload();
  }

  render() {
    const { title } = this.props;
  const renderTitle =  () =>{
    switch (title){
      case "Temperature":
        return<h6 className="m-0">{title} (°C)</h6>
        case "Pressure":
          return<h6 className="m-0">{title} (Pa)</h6>
          case "Humidity":
            return<h6 className="m-0">{title} (%)</h6>
          case "Subsoil Humidity":
          return<h6 className="m-0">{title} (%)</h6>
      default:
        break;
    }
}
    return (
      <Card small className="h-100">
        <CardHeader className="border-bottom d-flex justify-content-between">
            {renderTitle()}
          <Button onClick={() => this.goToSelctedChart(title)} squared theme="light">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M5.075 21.2Q4.125 21.2 3.463 20.538Q2.8 19.875 2.8 18.925V5.075Q2.8 4.125 3.463 3.462Q4.125 2.8 5.075 2.8H12V5.075H5.075Q5.075 5.075 5.075 5.075Q5.075 5.075 5.075 5.075V18.925Q5.075 18.925 5.075 18.925Q5.075 18.925 5.075 18.925H18.925Q18.925 18.925 18.925 18.925Q18.925 18.925 18.925 18.925V12H21.2V18.925Q21.2 19.875 20.538 20.538Q19.875 21.2 18.925 21.2ZM9.875 15.7 8.3 14.125 17.35 5.075H14V2.8H21.2V10H18.925V6.65Z" /></svg>
          </Button>
        </CardHeader>
        <CardBody className="pt-0 bg-light">
          <Row className="border-bottom py-2 bg-light">
            <Col sm="6" className="d-flex mb-2 mb-sm-0">
              <RangeDatePicker
                onChange={value => this.filtreBydate(value, title, this.state.codes)}
                EndingDatePlaceHolder="End Date"
                StartingDatePlaceHolder="Start Date"
                selected={new Date()}
              />
            </Col>
            {this.ReportButton()}
          </Row>
          <canvas
            height="140"
            ref={this.canvasRef}
            style={{ maxWidth: "100% !important" }}
          />
        </CardBody>
      </Card>
    );
  }
}

Chart.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,

  code: PropTypes.array,
  temperatureData: PropTypes.array,
  selected: PropTypes.object,


  /**
   * The component's data.
   */
  data: PropTypes.array,
  /**
   * The component's data.
   */
  data: PropTypes.array,
  /**
   * The chart's title.
   */
  chartName: PropTypes.string,
  /**
   * Should the component's Button be rendered .
   */
  hasButton: PropTypes.bool,
  /**
   * The chart's dataset.
   */
  dataSet: PropTypes.array,
  /**
   * The chart's labels.
   */
  labels: PropTypes.array,
  /**
   * The sensor levels.
   */
  sensorLevels: PropTypes.array,
  /**
   * The Chart.js options.
   */
  chartOptions: PropTypes.object
};

// Chart.defaultProps = {
//   title: "Field Status",
//   hasButton: true,
//   chartName: "Chart X",
//   labels: Array.from(new Array(7), (_, i) => (i === 0 ? 1 : i)),
//   sensorLevels: [500, 200],
//   dataSet: [
//     {
//       label: "Precipitations",
//       fill: "start",
//       data: [1500, 1300, 1750],
//       backgroundColor: "rgba(0,123,255,0.1)",
//       borderColor: "rgba(0,123,255,1)",
//       pointBackgroundColor: "#ffffff",
//       pointHoverBackgroundColor: "rgb(0,123,255)",
//       borderWidth: 1.5,
//       pointRadius: 0,
//       pointHoverRadius: 3
//     },
//     {
//       label: "Level1",
//       fill: "start",
//       data: [2000, 2000, 2000],
//       backgroundColor: "rgba(255,65,105,0.0)",
//       borderColor: "rgba(255,65,105,1)",
//       pointBackgroundColor: "#ffffff",
//       pointHoverBackgroundColor: "rgba(255,65,105,1)",
//       borderDash: [3, 3],
//       borderWidth: 1,
//       pointRadius: 0,
//       pointHoverRadius: 2,
//       pointBorderColor: "rgba(255,65,105,1)"
//     },
//     {
//       fill: "start",
//       label: "Level2",
//       data: [1000, 1000, 1000],
//       backgroundColor: "rgba(255,65,105,0.0)",
//       borderColor: "rgba(255,65,105,1)",
//       pointBackgroundColor: "#ffffff",
//       pointHoverBackgroundColor: "rgba(255,65,105,1)",
//       borderDash: [3, 3],
//       borderWidth: 1,
//       pointRadius: 0,
//       pointHoverRadius: 2,
//       pointBorderColor: "rgba(255,65,105,1)"
//     }
//   ]
// };

export default withRouter(Chart);
