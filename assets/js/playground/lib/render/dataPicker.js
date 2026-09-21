import { COLORS, baseLayout, axisDefaults } from "./colors.js";

const T_DENSE = Array.from({ length: 200 }, (_, i) => (i / 199) * 10.5);

// Figure 1 for the "explore data" trio: five candidate measurement times,
// toggled open (not in the fit) vs filled (pending/selected), plus the
// dense curve for whichever combo was last committed via the Fit button —
// toggling candidates never redraws the curve on its own.
export function renderDataPicker(el, { candidates, modelFamily, state, onToggle }) {
  function draw() {
    const { scenario, selectedTheta, pendingIndices } = state.get();

    const candidateTrace = {
      type: "scatter",
      mode: "markers",
      name: "data",
      x: candidates.map((c) => c.t),
      y: candidates.map((c) => c.y),
      customdata: candidates.map((_, i) => i),
      error_y: {
        type: "data",
        array: candidates.map((c) => c.sigma),
        visible: true,
        color: COLORS.data,
        thickness: 1.5,
        width: 4,
      },
      // "none" only suppresses the tooltip; "skip" would also block clicks.
      hoverinfo: "none",
      marker: {
        symbol: candidates.map((_, i) => (pendingIndices.includes(i) ? "circle" : "circle-open")),
        size: 10,
        color: COLORS.data,
        line: { color: COLORS.data, width: 1.5 },
      },
    };

    // Trace paint order matters here: the line goes in first so it sits
    // underneath the (larger) candidate markers instead of cutting across
    // them, with the prediction dots on top of everything as the highlight.
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

    traces.push(candidateTrace);

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
      xaxis: axisDefaults({ title: "t", range: [0, 10.5] }),
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
    onToggle(index);
  });
}
