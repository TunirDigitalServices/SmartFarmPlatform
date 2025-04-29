// import Plot from "chart.js";

// Plot.defaults.LineWithLine = Plot.defaults.line;
// Plot.controllers.LineWithLine = Plot.controllers.line.extend({
//   draw(ease) {
//     Plot.controllers.line.prototype.draw.call(this, ease);

//     if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
//       const activePoint = this.chart.tooltip._active[0];
//       const { ctx } = this.chart;
//       const { x } = activePoint.tooltipPosition();
//       const topY = this.chart.scales["y-axis-0"].top;
//       const bottomY = this.chart.scales["y-axis-0"].bottom;

//       // Draw the line
//       ctx.save();
//       ctx.beginPath();
//       ctx.moveTo(x, topY);
//       ctx.lineTo(x, bottomY);
//       ctx.lineWidth = 0.5;
//       ctx.strokeStyle = "#ddd";
//       ctx.stroke();
//       ctx.restore();
//     }
//   }
// });

// export default Plot;

import { Chart, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, CategoryScale } from 'chart.js';

// Register the parts you need
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, Tooltip, CategoryScale);

// Create a custom controller
class LineWithVerticalLineController extends LineController {
  draw() {
    super.draw();

    const active = this.chart.tooltip?._active;
    if (active && active.length) {
      const ctx = this.chart.ctx;
      const { x } = active[0].tooltipPosition();
      const topY = this.chart.scales.y.top;
      const bottomY = this.chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ddd';
      ctx.stroke();
      ctx.restore();
    }
  }
}

// Register the new controller
Chart.register(LineWithVerticalLineController);

export default Chart;
