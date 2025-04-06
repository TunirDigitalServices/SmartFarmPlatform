import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import shortid from "shortid";
import "./Styles.css";
import { withTranslation  } from "react-i18next";


import Plot from "../../utils/plot";

class SmallStats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      farms:[],
      resultFields:[]
    }; 

    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    const chartOptions = {
      ...{
        maintainAspectRatio: true,
        responsive: true,
        legend: {
          display: false
        },
        tooltips: {
          enabled: false,
          custom: false
        },
        elements: {
          point: {
            radius: 0
          },
          line: {
            tension: 0.33
          }
        },
        scales: {
          xAxes: [
            {
              gridLines: false,
              ticks: {
                display: false
              }
            }
          ],
          yAxes: [
            {
              gridLines: false,
              scaleLabel: false,
              ticks: {
                display: false,
                isplay: false,
                // Avoid getting the graph line cut of at the top of the canvas.
                // Chart.js bug link: https://github.com/chartjs/Chart.js/issues/4790
                suggestedMax: Math.max(...this.props.chartData[0].data) + 1
              }
            }
          ]
        }
      },
      ...this.props.chartOptions
    };

    const chartConfig = {
      ...{
        type: "line",
        data: {
          ...{
            labels: this.props.chartLabels
          },
          ...{
            datasets: this.props.chartData
          }
        },
        options: chartOptions
      },
      ...this.props.chartConfig
    };

    new Plot(this.canvasRef.current, chartConfig);
  }


  
  render() {

    const { t } = this.props;


    const {
      variation,
      state,
      icon,
      label,
      value
      //percentage, increase
    } = this.props;
    



    const canvasHeight = variation === "1" ? 120 : 60;

    const RSBHeader = classNames(
      //"SBHeader",
      state === `${t('Critical')}`
        ? "critical"
        : state === `${t('Optimal')}`
        ? "optimal"
        : state === `${t('Full')}`
        ? "full"
        : null
    );
     const valid = (state) => { 
      switch (state) {
        case `${t('low_batt')}`:
          case `${t('offline')}`:
            case `${t('online')}`:
              return this.props.ToSensorPage()
        default:
          return this.props.FilterByStatus(state)
      }
    }

    return (
      <div onClick={() => valid(state)} className="statsBox" style={{ width: "33%"}} >
        <div
          className={RSBHeader }
          style={{
            height: "75%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "40px",
              justifyContent: "space-between",
              fontSize: "17px",
              padding: "5px",
              marginBottom: "10px"
            }}
          >
         
          </div>
          <h2 className={RSBHeader}>{value}</h2>
          <span> {state}</span>
          <p style={{textAlign:"center"}} className={RSBHeader}>{icon}</p>
        </div>
        <canvas
          height={canvasHeight}
          ref={this.canvasRef}
          className={`stats-small-${shortid()}`}
        />
      </div>
    );
  }
}

SmallStats.propTypes = {
  /**
   * The Small Stats variation.
   */
  //variation: PropTypes.string,
  /**
   * The label.
   */
  state: PropTypes.string,
  /**
   * The label.
   */
  icon: PropTypes.string,
  /**
   * The label.
   */
  label: PropTypes.string,
  /**
   * The value.
   */
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * The percentage number or string.
   */
  //percentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * Whether is a value increase, or not.
   */
  //increase: PropTypes.bool,
  /**
   * The Chart.js configuration object.
   */
  chartConfig: PropTypes.object,
  /**
   * The Chart.js options object.
   */
  chartOptions: PropTypes.object,
  /**
   * The chart data.
   */
  chartData: PropTypes.array.isRequired,
  /**
   * The chart labels.
   */
  chartLabels: PropTypes.array
};

SmallStats.defaultProps = {
  //increase: true,
  //percentage: 0,
  icon: "",
  state: "State",
  value: 0,
  label: "Label",
  chartOptions: Object.create(null),
  chartConfig: Object.create(null),
  chartData: [],
  chartLabels: []
};

export default withTranslation()(SmallStats);
