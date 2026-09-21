// Palette pulled from the site's data-viz standard (categorical slots 1/2/3/7
// and the sequential blue ramp), validated with the dataviz skill's
// validate_palette.js for CVD-safety and contrast before use here.
export const COLORS = {
  modelLine: "#2a78d6", // categorical slot 1 (blue) — used only where no heatmap sits behind it
  data: "#eb6834", // categorical slot 2 (orange) — the measured/true data
  selected: "#1baf7a", // categorical slot 3 (aqua) — predictions / best fit in Figures 1 & 3
  paramPoint: "#e34948", // categorical slot 8 (red) — every sampled point in parameter space, uniformly
  // chosen over the palette's violet slot specifically because violet sits too close to Viridis's own
  // hues; red reads clearly against it even though it trades away this pairing's CVD safety margin.
  ink: "#0b0b0b",
  inkSecondary: "#52514e",
  inkMuted: "#898781",
  gridline: "#e1e0d9",
  baseline: "#c3c2b7",
  surface: "#fcfcfb",
  markerStroke: "#ffffff",
};

// Viridis for magnitude encodings (cost, distance) — perceptually uniform,
// colorblind-safe, and higher-contrast than the site's flat sequential blue,
// which is the point: these two heatmaps are meant to read dramatically.
export const SEQUENTIAL_COLORSCALE = "Viridis";

export function baseLayout(overrides = {}) {
  const font = {
    family:
      'system-ui, -apple-system, "Segoe UI", sans-serif',
    color: COLORS.inkSecondary,
    size: 12,
  };
  return {
    paper_bgcolor: COLORS.surface,
    plot_bgcolor: COLORS.surface,
    font,
    margin: { l: 50, r: 20, t: 10, b: 40 },
    showlegend: true,
    legend: { orientation: "h", y: -0.2, font },
    hoverlabel: { bgcolor: COLORS.surface, font },
    ...overrides,
  };
}

export function axisDefaults(overrides = {}) {
  return {
    gridcolor: COLORS.gridline,
    zerolinecolor: COLORS.baseline,
    linecolor: COLORS.baseline,
    tickfont: { color: COLORS.inkMuted, size: 11 },
    title: { font: { color: COLORS.inkSecondary, size: 12 } },
    ...overrides,
  };
}
