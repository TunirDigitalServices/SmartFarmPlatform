import React from 'react'
import PropTypes from "prop-types";
import classNames from "classnames";
import shortid from "shortid";
import "./Styles.css";
import { withTranslation  } from "react-i18next";

const SmallStatsFields = ({RSBHeader,state,icon,value,label}) => {
  return (
    <div className="statsBox" style={{ width: "33%"}} >
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
        <p style={{ padding: "0px", margin: "0px", lineHeight: "20px" }}>
          <div> {state}</div>
        </p>
        {value}
      </div>
      <h2 className={RSBHeader}>{icon}</h2>
      <p className={RSBHeader}>{label}</p>
    </div>
    <canvas
    //   height={canvasHeight}
    //   ref={this.canvasRef}
    //   className={`stats-small-${shortid()}`}
    />
  </div>
  )
}

export default SmallStatsFields