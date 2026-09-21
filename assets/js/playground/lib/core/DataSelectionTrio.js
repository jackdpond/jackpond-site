import { createState } from "./state.js";
import { renderDataPicker } from "../render/dataPicker.js";
import { renderParamSpace } from "../render/paramSpace.js";
import { renderManifold } from "../render/manifold.js";
import { renderReadout } from "../render/readout.js";

function resolveEl(target) {
  return typeof target === "string" ? document.querySelector(target) : target;
}

// Reshapes one precomputed combo into the same {data, paramGrid,
// paramSpacePoints, manifoldGrid} shape Trio 1's scenarios use, so
// paramSpace.js/manifold.js/readout.js can render it completely unchanged.
// contourA/contourB/misc are left empty — this figure "doesn't have
// options", per the second trio's spec, just the best fit in its basin.
function buildScenarioView(root, key) {
  const combo = root.combos[key];
  return {
    data: combo.data,
    paramGrid: {
      logK1: root.paramAxes.logK1,
      logK2: root.paramAxes.logK2,
      log10Cost: combo.log10Cost,
      contourStart: root.contour.start,
      contourStep: root.contour.step,
      contourEnd: root.contour.end,
    },
    paramSpacePoints: { bestFit: combo.bestFit, contourA: [], contourB: [], misc: [] },
    manifoldGrid: combo.manifold,
    manifoldColor: root.manifoldColor,
  };
}

function sortedKey(indices) {
  return [...indices].sort((a, b) => a - b).join(",");
}

const DEFAULT_INDICES = [0, 1, 2];

// A linked trio for mode 2 ("explore data"): the user toggles which three
// of five candidate measurement times to fit and presses Fit to commit —
// unlike Trio 1's continuous click-to-select, nothing recomputes until
// that explicit commit, since the whole point is comparing chosen combos,
// not dragging a live selection around.
export class DataSelectionTrio {
  constructor({ modelFamily, scenario }) {
    this.modelFamily = modelFamily;
    this.root = scenario;
    const key = sortedKey(DEFAULT_INDICES);
    this.state = createState({
      pendingIndices: DEFAULT_INDICES,
      committedKey: key,
      selectedTheta: scenario.combos[key].bestFit,
      scenario: buildScenarioView(scenario, key),
    });
  }

  toggleCandidate(index) {
    const current = this.state.get().pendingIndices;
    const next = current.includes(index)
      ? current.filter((i) => i !== index)
      : current.length < 3
        ? [...current, index]
        : current; // already 3 selected — must deselect one before adding another
    this.state.set({ pendingIndices: next });
  }

  commitFit() {
    const { pendingIndices } = this.state.get();
    if (pendingIndices.length !== 3) return;
    const key = sortedKey(pendingIndices);
    const combo = this.root.combos[key];
    this.state.set({
      committedKey: key,
      selectedTheta: combo.bestFit,
      scenario: buildScenarioView(this.root, key),
    });
  }

  mount({ dataPicker, paramSpace, manifold, readout, fitButton, fitStatus }) {
    const els = {
      dataPicker: resolveEl(dataPicker),
      paramSpace: resolveEl(paramSpace),
      manifold: resolveEl(manifold),
      readout: readout ? resolveEl(readout) : null,
      fitButton: fitButton ? resolveEl(fitButton) : null,
      fitStatus: fitStatus ? resolveEl(fitStatus) : null,
    };
    const ctx = { modelFamily: this.modelFamily, state: this.state };

    renderDataPicker(els.dataPicker, {
      candidates: this.root.candidates,
      modelFamily: this.modelFamily,
      state: this.state,
      onToggle: (index) => this.toggleCandidate(index),
    });
    renderParamSpace(els.paramSpace, { ...ctx, onSelect: () => {} });
    renderManifold(els.manifold, ctx);
    if (els.readout) renderReadout(els.readout, ctx);

    if (els.fitButton) {
      els.fitButton.addEventListener("click", () => this.commitFit());
    }

    if (els.fitStatus) {
      const drawStatus = () => {
        const { pendingIndices, committedKey } = this.state.get();
        const remaining = 3 - pendingIndices.length;
        if (remaining > 0) {
          els.fitStatus.textContent = `Pick ${remaining} more point${remaining === 1 ? "" : "s"}.`;
        } else if (sortedKey(pendingIndices) === committedKey) {
          els.fitStatus.textContent = "Fitted to the selected points.";
        } else {
          els.fitStatus.textContent = "Press Fit to update.";
        }
        if (els.fitButton) els.fitButton.disabled = pendingIndices.length !== 3;
      };
      drawStatus();
      this.state.subscribe(drawStatus);
    }

    return this;
  }
}
