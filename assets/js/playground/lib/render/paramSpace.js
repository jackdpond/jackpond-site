import { COLORS, baseLayout, axisDefaults, SEQUENTIAL_COLORSCALE } from "./colors.js";

function toCustomdata(points) {
  // Plotly reports the clicked marker's data via customdata; each point
  // carries its own [k1, k2] pair so the click handler doesn't need to
  // re-derive it from pixel position.
  return points.map((p) => p);
}

function sameTheta(a, b) {
  return a && b && Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;
}

// Figure 2: log10(k1)/log10(k2) parameter space, with the precomputed cost
// contour as a heatmap-ish surface and clickable scatter points: the best
// fit, two cost-contour rings, and a handful of miscellaneous samples — all
// drawn identically, so nothing but the live readout tells them apart until
// you click one.
export function renderParamSpace(el, { state, onSelect }) {
  function draw() {
    const { scenario, selectedTheta: selected } = state.get();
    const { logK1, logK2, log10Cost, contourStart, contourStep, contourEnd: explicitEnd } =
      scenario.paramGrid;
    const { bestFit, contourA = [], contourB = [], misc = [] } = scenario.paramSpacePoints;
    const allPoints = [...misc, ...contourA, ...contourB, bestFit];
    // A shared end (set when several scenarios should read off one
    // consistent contour scale, e.g. Trio 2's ten combos) beats each
    // scenario auto-scaling to its own local max.
    const contourEnd = explicitEnd ?? Math.max(...log10Cost.map((row) => Math.max(...row)));

    const contourTrace = {
      type: "contour",
      x: logK1,
      y: logK2,
      z: log10Cost,
      colorscale: SEQUENTIAL_COLORSCALE,
      // autocontour defaults to true, which silently ignores contours.start
      // /size below and lets Plotly pick its own levels — that mismatch (not
      // smoothing) is why the drawn lines didn't match the precomputed ring
      // points. Has to be turned off for an explicit start/size to take effect.
      autocontour: false,
      // Explicit start/size (matching the precompute script's ring spacing)
      // so the drawn lines land exactly where contourA/contourB actually sit.
      contours: {
        start: contourStart,
        end: contourEnd,
        size: contourStep,
        coloring: "heatmap",
        showlines: true,
        line: { width: 0.5, color: COLORS.gridline },
        smoothing: 0,
      },
      colorbar: { title: { text: "log₁₀ cost", side: "right" }, thickness: 14 },
      hoverinfo: "skip",
    };

    const pointsTrace = {
      type: "scatter",
      mode: "markers",
      x: allPoints.map((p) => Math.log10(p[0])),
      y: allPoints.map((p) => Math.log10(p[1])),
      customdata: toCustomdata(allPoints),
      showlegend: false,
      // "none" only suppresses the visible tooltip; "skip" removes the trace
      // from hit-testing entirely, which silently kills click events too.
      hoverinfo: "none",
      marker: {
        symbol: "circle-open",
        size: 11,
        color: COLORS.paramPoint,
        line: { color: COLORS.paramPoint, width: 1.5 },
      },
    };

    // The selection reads as a filled dot nested inside that point's ring,
    // rather than a separate color or a bigger outline.
    const selectionFillTrace = {
      type: "scatter",
      mode: "markers",
      x: [Math.log10(selected[0])],
      y: [Math.log10(selected[1])],
      customdata: [selected],
      showlegend: false,
      marker: { symbol: "circle", size: 5, color: COLORS.paramPoint },
      hoverinfo: "skip",
    };

    const traces = [contourTrace, pointsTrace, selectionFillTrace];

    const layout = baseLayout({
      xaxis: axisDefaults({ title: "log₁₀ k₁" }),
      yaxis: axisDefaults({ title: "log₁₀ k₂" }),
      height: 420,
      margin: { l: 50, r: 20, t: 10, b: 40 },
      showlegend: false,
    });

    Plotly.react(el, traces, layout, { displayModeBar: false, responsive: true });
  }

  draw();
  state.subscribe(draw);

  // The graph div's event emitter survives Plotly.react redraws, so this
  // only needs to be bound once rather than after every draw().
  el.on("plotly_click", (evt) => {
    const point = evt.points?.[0];
    const theta = point?.customdata;
    if (!theta || sameTheta(theta, state.get().selectedTheta)) return;
    onSelect(theta);
  });
}
