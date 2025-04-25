import React from "react";
import { CenturyView } from "react-calendar";
import { Container, Row, Col } from "shards-react";

export default function SS() {
  return (
    <>
      <div class="sensorHeader">
        <div>
          <p style={{ margin: 0 }}>
            Last Reading : <span>date</span>
          </p>
          <p style={{ margin: 0 }}>QRCode</p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row"
            }}
          >
            <p>Low</p>
            <i class="far fa-check-circle"></i>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row"
            }}
          >
            <p>76%</p>
            <i class="far fa-check-circle"></i>
          </div>
        </div>
      </div>
    </>
  );
}
