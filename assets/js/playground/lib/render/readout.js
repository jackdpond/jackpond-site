// Live params + cost strip, shared by all trio modes: the numeric proof
// that two points on the same cost contour really do have the same cost.
export function renderReadout(el, { modelFamily, state }) {
  function draw() {
    const { scenario, selectedTheta: theta } = state.get();
    const cost = modelFamily.cost(theta, scenario.data);
    const [k1, k2] = theta;

    el.innerHTML = [
      item("k₁", k1.toFixed(3)),
      item("k₂", k2.toFixed(3)),
      item("cost", cost.toFixed(3)),
    ].join("");
  }

  function item(label, value) {
    return `<span class="trio-readout-item"><span class="trio-readout-label">${label}</span>${value}</span>`;
  }

  draw();
  state.subscribe(draw);
}
