import { COLORS, baseLayout, axisDefaults } from "./colors.js";

const T_DENSE = Array.from({ length: 200 }, (_, i) => (i / 199) * 10);

// Figure 1: f(t) vs t — dense curve for the selected theta, plus the fixed
// data points (with uncertainty bars) and the model's predictions at those
// same times.
export function renderTimeSeries(el, { modelFamily, state }) {
  function draw() {
    const { scenario, selectedTheta: theta } = state.get();
    const dense = modelFamily.predict(theta, T_DENSE);
    const predAtData = modelFamily.predict(theta, scenario.data.t);

    const traces = [
      {
        x: T_DENSE,
        y: dense,
        mode: "lines",
        name: "model",
        line: { color: COLORS.modelLine, width: 2 },
        hoverinfo: "skip",
      },
      {
        x: scenario.data.t,
        y: scenario.data.y,
        mode: "markers",
        name: "data",
        error_y: {
          type: "data",
          array: scenario.data.sigma,
          visible: true,
          color: COLORS.data,
          thickness: 1.5,
          width: 4,
        },
        marker: { color: COLORS.data, size: 9, line: { color: COLORS.markerStroke, width: 1 } },
      },
      {
        x: scenario.data.t,
        y: predAtData,
        mode: "markers",
        name: "predictions",
        marker: {
          color: COLORS.selected,
          size: 9,
          line: { color: COLORS.markerStroke, width: 1 },
        },
      },
    ];

    const layout = baseLayout({
      xaxis: axisDefaults({ title: "t", range: [0, 10] }),
      yaxis: axisDefaults({ title: "f(t)" }),
      height: 340,
      margin: { l: 50, r: 20, t: 40, b: 40 },
      legend: {
        orientation: "h",
        y: 1.2,
        yanchor: "bottom",
        x: 0.5,
        xanchor: "center",
        font: { color: COLORS.inkSecondary, size: 12 },
      },
    });

    Plotly.react(el, traces, layout, { displayModeBar: false, responsive: true });
  }

  draw();
  state.subscribe(draw);
}
