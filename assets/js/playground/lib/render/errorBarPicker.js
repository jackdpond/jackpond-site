import { COLORS, baseLayout, axisDefaults } from "./colors.js";

const T_DENSE = Array.from({ length: 200 }, (_, i) => (i / 199) * 10);

function stateKey(states) {
  return states.join(",");
}

// Figure 1 for the "explore uncertainty" trio: three fixed data points
// whose error bars cycle medium -> loose -> tight -> medium on click, live
// (before any Fit — the bar length itself is the only feedback), plus the
// dense curve for whichever uncertainty setting was last committed via the
// Fit button.
export function renderErrorBarPicker(el, { dataT, dataY, combos, modelFamily, state, onCycle }) {
  function draw() {
    const { scenario, selectedTheta, pendingStates } = state.get();
    const pendingSigma = combos[stateKey(pendingStates)].sigma;

    const dataTrace = {
      type: "scatter",
      mode: "markers",
      name: "data",
      x: dataT,
      y: dataY,
      customdata: dataT.map((_, i) => i),
      error_y: {
        type: "data",
        array: pendingSigma,
        visible: true,
        color: COLORS.data,
        thickness: 1.5,
        width: 4,
      },
      // "none" only suppresses the tooltip; "skip" would also block clicks.
      hoverinfo: "none",
      marker: { color: COLORS.data, size: 9, line: { color: COLORS.markerStroke, width: 1 } },
    };

    // Line goes in first so it sits underneath the data markers rather
    // than cutting across them; predictions on top as the highlight.
    const traces = [];

    if (scenario) {
      const dense = modelFamily.predict(selectedTheta, T_DENSE);
      traces.push({
        type: "scatter",
        mode: "lines",
        name: "model",
        x: T_DENSE,
        y: dense,
        line: { color: COLORS.modelLine, width: 2 },
        hoverinfo: "skip",
      });
    }

    traces.push(dataTrace);

    if (scenario) {
      const predAtData = modelFamily.predict(selectedTheta, scenario.data.t);
      traces.push({
        type: "scatter",
        mode: "markers",
        name: "predictions",
        x: scenario.data.t,
        y: predAtData,
        marker: { color: COLORS.selected, size: 9, line: { color: COLORS.markerStroke, width: 1 } },
      });
    }

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

  el.on("plotly_click", (evt) => {
    const index = evt.points?.[0]?.customdata;
    if (index === undefined) return;
    onCycle(index);
  });
}
