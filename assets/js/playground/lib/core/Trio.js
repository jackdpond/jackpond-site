import { createState } from "./state.js";
import { renderTimeSeries } from "../render/timeSeries.js";
import { renderParamSpace } from "../render/paramSpace.js";
import { renderManifold } from "../render/manifold.js";
import { renderReadout } from "../render/readout.js";

function resolveEl(target) {
  return typeof target === "string" ? document.querySelector(target) : target;
}

// A linked trio of figures (time series / parameter space / model manifold)
// over one model family and one precomputed scenario. Mode 1 ("explore
// parameters"): the user clicks points in parameter space and every figure
// updates to reflect the selected theta.
export class Trio {
  constructor({ modelFamily, scenario }) {
    this.modelFamily = modelFamily;
    this.state = createState({ selectedTheta: scenario.paramSpacePoints.bestFit, scenario });
  }

  mount({ timeSeries, paramSpace, manifold, readout }) {
    const els = {
      timeSeries: resolveEl(timeSeries),
      paramSpace: resolveEl(paramSpace),
      manifold: resolveEl(manifold),
      readout: readout ? resolveEl(readout) : null,
    };
    const ctx = { modelFamily: this.modelFamily, state: this.state };

    renderTimeSeries(els.timeSeries, ctx);
    renderParamSpace(els.paramSpace, {
      ...ctx,
      onSelect: (theta) => this.state.set({ selectedTheta: theta }),
    });
    renderManifold(els.manifold, ctx);
    if (els.readout) renderReadout(els.readout, ctx);

    return this;
  }
}
