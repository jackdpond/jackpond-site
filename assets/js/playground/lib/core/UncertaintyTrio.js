import { createState } from "./state.js";
import { renderErrorBarPicker } from "../render/errorBarPicker.js";
import { renderParamSpace } from "../render/paramSpace.js";
import { renderManifold } from "../render/manifold.js";
import { renderReadout } from "../render/readout.js";

function resolveEl(target) {
  return typeof target === "string" ? document.querySelector(target) : target;
}

function stateKey(states) {
  return states.join(",");
}

// Reshapes one precomputed combo into the same {data, paramGrid,
// paramSpacePoints, manifoldGrid} shape Trio 1's scenarios use. The
// manifold's (x, y, z) geometry is shared across every combo (data and
// theta never change here, only the weighting), so it's pulled from the
// root scenario rather than the combo itself.
function buildScenarioView(root, key) {
  const combo = root.combos[key];
  return {
    data: { t: root.data.t, y: root.data.y, sigma: combo.sigma },
    paramGrid: {
      logK1: root.paramAxes.logK1,
      logK2: root.paramAxes.logK2,
      log10Cost: combo.log10Cost,
      contourStart: root.contour.start,
      contourStep: root.contour.step,
      contourEnd: root.contour.end,
    },
    paramSpacePoints: { bestFit: combo.bestFit, contourA: [], contourB: [], misc: [] },
    manifoldGrid: {
      x: root.manifoldGeometry.x,
      y: root.manifoldGeometry.y,
      z: root.manifoldGeometry.z,
      distance: combo.distance,
    },
    manifoldColor: root.manifoldColor,
    manifoldColorLabel: root.manifoldColorLabel,
  };
}

const DEFAULT_STATES = [0, 0, 0]; // medium, medium, medium
const NUM_STATES = 3; // cycle order: medium -> loose -> tight -> medium

// A linked trio for mode 3 ("explore uncertainty"): the same three fixed
// data points as Trio 1, but each one's error bar independently cycles
// through three presets on click, live, before an explicit Fit commits the
// combination — same discipline as Trio 2, nothing recomputes until then.
export class UncertaintyTrio {
  constructor({ modelFamily, scenario }) {
    this.modelFamily = modelFamily;
    this.root = scenario;
    const key = stateKey(DEFAULT_STATES);
    this.state = createState({
      pendingStates: DEFAULT_STATES,
      committedKey: key,
      selectedTheta: scenario.combos[key].bestFit,
      scenario: buildScenarioView(scenario, key),
    });
  }

  cycleState(index) {
    const current = this.state.get().pendingStates;
    const next = current.slice();
    next[index] = (next[index] + 1) % NUM_STATES;
    this.state.set({ pendingStates: next });
  }

  commitFit() {
    const { pendingStates } = this.state.get();
    const key = stateKey(pendingStates);
    const combo = this.root.combos[key];
    this.state.set({
      committedKey: key,
      selectedTheta: combo.bestFit,
      scenario: buildScenarioView(this.root, key),
    });
  }

  mount({ errorBarPicker, paramSpace, manifold, readout, fitButton, fitStatus }) {
    const els = {
      errorBarPicker: resolveEl(errorBarPicker),
      paramSpace: resolveEl(paramSpace),
      manifold: resolveEl(manifold),
      readout: readout ? resolveEl(readout) : null,
      fitButton: fitButton ? resolveEl(fitButton) : null,
      fitStatus: fitStatus ? resolveEl(fitStatus) : null,
    };
    const ctx = { modelFamily: this.modelFamily, state: this.state };

    renderErrorBarPicker(els.errorBarPicker, {
      dataT: this.root.data.t,
      dataY: this.root.data.y,
      combos: this.root.combos,
      modelFamily: this.modelFamily,
      state: this.state,
      onCycle: (index) => this.cycleState(index),
    });
    renderParamSpace(els.paramSpace, { ...ctx, onSelect: () => {} });
    renderManifold(els.manifold, ctx);
    if (els.readout) renderReadout(els.readout, ctx);

    if (els.fitButton) {
      els.fitButton.addEventListener("click", () => this.commitFit());
    }

    if (els.fitStatus) {
      const drawStatus = () => {
        const { pendingStates, committedKey } = this.state.get();
        els.fitStatus.textContent =
          stateKey(pendingStates) === committedKey
            ? "Fitted to the current settings."
            : "Press Fit to update.";
      };
      drawStatus();
      this.state.subscribe(drawStatus);
    }

    return this;
  }
}
