import { COLORS, baseLayout, SEQUENTIAL_COLORSCALE } from "./colors.js";

// Figure 3: the model manifold in prediction space — the image of the
// parameter grid under predict(theta, dataT), colored by distance to the
// true data point, with the current selection's prediction marked on it.
export function renderManifold(el, { modelFamily, state }) {
  function draw() {
    const { scenario, selectedTheta: theta } = state.get();
    const { x, y, z, distance } = scenario.manifoldGrid;
    const [dataX, dataY, dataZ] = scenario.data.y;
    // Optional shared min/max (set when several scenarios should read off
    // one consistent color scale, e.g. Trio 2's ten data-selection combos)
    // instead of each scenario auto-scaling to its own local range.
    const colorRange = scenario.manifoldColor;

    const surfaceTrace = {
      type: "surface",
      x,
      y,
      z,
      surfacecolor: distance,
      colorscale: SEQUENTIAL_COLORSCALE,
      cmin: colorRange?.min,
      cmax: colorRange?.max,
      showscale: true,
      colorbar: {
        title: { text: scenario.manifoldColorLabel ?? "distance to data", side: "right" },
        thickness: 14,
      },
      opacity: 0.95,
      hoverinfo: "skip",
    };

    const truthTrace = {
      type: "scatter3d",
      mode: "markers",
      name: "true data",
      x: [dataX],
      y: [dataY],
      z: [dataZ],
      marker: { size: 4, color: COLORS.data, line: { color: COLORS.markerStroke, width: 0.5 } },
    };

    const [px, py, pz] = modelFamily.predict(theta, scenario.data.t);
    const bestFitTrace = {
      type: "scatter3d",
      mode: "markers",
      name: "best fit",
      x: [px],
      y: [py],
      z: [pz],
      marker: { size: 4, color: COLORS.selected, line: { color: COLORS.markerStroke, width: 0.5 } },
    };

    const axisTitle = (t) => `y(t=${t})`;
    const layout = baseLayout({
      height: 420,
      scene: {
        xaxis: {
          title: axisTitle(scenario.data.t[0]),
          backgroundcolor: COLORS.surface,
          gridcolor: COLORS.gridline,
        },
        yaxis: {
          title: axisTitle(scenario.data.t[1]),
          backgroundcolor: COLORS.surface,
          gridcolor: COLORS.gridline,
        },
        zaxis: {
          title: axisTitle(scenario.data.t[2]),
          backgroundcolor: COLORS.surface,
          gridcolor: COLORS.gridline,
        },
      },
      margin: { l: 0, r: 0, t: 10, b: 0 },
    });

    Plotly.react(el, [surfaceTrace, truthTrace, bestFitTrace], layout, {
      displayModeBar: false,
      responsive: true,
    });
  }

  draw();
  state.subscribe(draw);
}
