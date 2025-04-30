import React from "react";

function weatherPin(text, value, pinHeight, index, mark) {
  return (
    <div className="weatherPinWrapper">
      <div
        className="weatherPinOuterContainer"
        style={{
          animation: `translate${index} 1.25s`,
          top: `${(1 - pinHeight) * 280 - 40}px`
        }}
      >
        <style>{`
              @keyframes translate${index} {
                   0% { top: 280px; }
                   100% { top: ${(1 - pinHeight) * 280 - 40}px; }
              }
          `}</style>
        <p className="weatherPinValue">
          {value}
          {mark}
        </p>
        <div className="weatherPinContainer">
          <div className="weatherPinBall"></div>
          <div className="weatherPin"></div>
        </div>
      </div>
      <p className="weatherPinText">{text}</p>
    </div>
  );
}

export default weatherPin;
