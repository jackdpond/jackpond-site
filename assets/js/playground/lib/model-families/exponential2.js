// Two-compartment absorption/elimination model:
//   y(t; k1, k2) = k1/(k1 - k2) * (exp(-k2 t) - exp(-k1 t))
// k1 is the absorption rate constant, k2 the elimination rate constant.
// At k1 === k2 the closed form is 0/0; L'Hopital gives k t exp(-k t) there.
const DEGENERACY_EPS = 1e-6;

function evalAt(k1, k2, t) {
  if (Math.abs(k1 - k2) < DEGENERACY_EPS) {
    const k = (k1 + k2) / 2;
    return k * t * Math.exp(-k * t);
  }
  return (k1 / (k1 - k2)) * (Math.exp(-k2 * t) - Math.exp(-k1 * t));
}

export const exponential2 = {
  id: "exponential2",
  paramNames: ["k1", "k2"],

  predict(theta, t) {
    const [k1, k2] = theta;
    if (Array.isArray(t)) return t.map((ti) => evalAt(k1, k2, ti));
    return evalAt(k1, k2, t);
  },

  // Weighted sum-of-squares cost against data = { t, y, sigma }.
  cost(theta, data) {
    const pred = this.predict(theta, data.t);
    let sum = 0;
    for (let i = 0; i < data.t.length; i++) {
      const sigma = data.sigma?.[i] ?? 1;
      const r = (pred[i] - data.y[i]) / sigma;
      sum += r * r;
    }
    return sum;
  },
};
