import { useEffect, useState } from "react";
import "../Calculator/Calculator.css";
import numeral from "numeral";

function normInv(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;

    const a1 = -39.69683028665376,
        a2 = 220.9460984245205,
        a3 = -275.9285104469687,
        a4 = 138.3577518672690,
        a5 = -30.66479806614716,
        a6 = 2.506628277459239;

    const b1 = -54.47609879822406,
        b2 = 161.5858368580409,
        b3 = -155.6989798598866,
        b4 = 66.80131188771972,
        b5 = -13.28068155288572;

    const c1 = -0.007784894002430293,
        c2 = -0.3223964580411365,
        c3 = -2.400758277161838,
        c4 = -2.549732539343734,
        c5 = 4.374664141464968,
        c6 = 2.938163982698783;

    const d1 = 0.007784695709041462,
        d2 = 0.3224671290700398,
        d3 = 2.445134137142996,
        d4 = 3.754408661907416;

    const plow = 0.02425;
    const phigh = 1 - plow;

    let q, r, x;
    if (p < plow) {
        q = Math.sqrt(-2 * Math.log(p));
        x =
            (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
            ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (p > phigh) {
        q = Math.sqrt(-2 * Math.log(1 - p));
        x =
            -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
            ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else {
        q = p - 0.5;
        r = q * q;
        x =
            (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
            (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    }
    const e = 0.5 * (1 + erf(x / Math.SQRT2)) - p;
    const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
    x = x - u / (1 + (x * u) / 2);
    return x;
}

function erf(x) {
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const a1 = 0.254829592,
        a2 = -0.284496736,
        a3 = 1.421413741,
        a4 = -1.453152027,
        a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1 / (1 + p * x);
    const y =
        1 -
        (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
    return sign * y;
}

function calcAll() {
    const c = Number(document.getElementById("confidence").value);
    const pwr = Number(document.getElementById("power").value);
    const m = Number(document.getElementById("MDE").value);
    const T = Number(document.getElementById("tails").value);
    const K = Number(document.getElementById("numberOfInputVars").value);
    const mu0 = Number(document.getElementById("mean").value);
    const sigma = Number(document.getElementById("standardDeviation").value);
    const daily = Number(document.getElementById("dailyTraffic").value);

    if (
        [c, pwr, m, K, mu0, sigma, daily].some((x) => !isFinite(x)) ||
        ![1, 2].includes(T) ||
        K < 0 ||
        sigma < 0 ||
        mu0 < 0 ||
        daily <= 0
    ) {
        return null;
    }

    const zBeta = normInv(pwr);
    const zAlpha = normInv(1 - (1 - c) / T);
    const zAlphaBon = normInv(1 - (1 - c) / (T * Math.max(1, K)));

    const mu1 = mu0 * (1 + m);

    const denom = (mu1 - mu0) ** 2;
    const commonNum = 2 * sigma * sigma;

    const n = ((zAlpha + zBeta) ** 2 * commonNum) / denom;
    const nBon = ((zAlphaBon + zBeta) ** 2 * commonNum) / denom;

    const perRecipe = Math.ceil(n);
    const perRecipeBon = Math.ceil(nBon);

    const total = perRecipe * (K + 1);
    const totalBon = perRecipeBon * (K + 1);

    const duration = Math.ceil(total / daily);
    const durationBon = Math.ceil(totalBon / daily);

    return {
        noBon: { mu1, perRecipe, total, duration },
        bon: { mu1, perRecipe: perRecipeBon, total: totalBon, duration: durationBon },
    };
}

function handleTestVars(v) {
    if (v > 1) {
        Array.from(document.querySelectorAll(".bon")).forEach(el => {
            el.style.display = "block";
        })
        document.getElementById("output-container").style.display = "grid"
    } else {
        Array.from(document.querySelectorAll(".bon")).forEach(el => {
            el.style.display = "none";
        })
        document.getElementById("output-container").style.display = "block"
    }
}

function CalculatorOutputs() {
    const [state, setState] = useState(null);

    useEffect(() => {
        setState(calcAll());

        const ids = [
            "confidence",
            "power",
            "MDE",
            "mean",
            "standardDeviation",
            "dailyTraffic",
        ];

        const cleanups = [];

        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;

            const handler = () => setState(calcAll());

            const prev = el.onValueChange;
            el.onValueChange = (...args) => {
                prev && prev.apply(el, args);
                handler();
            };

            cleanups.push(() => {
                el.onValueChange = prev ?? null;
            });
        });

        const numberOfInputVars = document.getElementById("numberOfInputVars")
        numberOfInputVars.onValueChange = (v) => {
            setState(calcAll());
            handleTestVars(v);
        }

        const tails = document.getElementById("tails");
        const onTailsChange = () => setState(calcAll());
        if (tails) {
            tails.addEventListener("change", onTailsChange);
            cleanups.push(() => tails.removeEventListener("change", onTailsChange));
        }

        return () => cleanups.forEach((fn) => fn());
    }, []);
    if (!state) {
        return (
            <section className="calc-card">
                <h2 className="calc-title">Results</h2>
                <div className="calc-grid">
                    <div className="calc-field"><span className="calc-label">Estimated Test Average</span><div className="calc-output">—</div></div>
                    <div className="calc-field"><span className="calc-label">Sample Size per Recipe</span><div className="calc-output">—</div></div>
                    <div className="calc-field"><span className="calc-label">Total Sample Size</span><div className="calc-output">—</div></div>
                    <div className="calc-field"><span className="calc-label">Estimated Duration (days)</span><div className="calc-output">—</div></div>
                </div>
            </section>
        );
    }

    const { noBon, bon } = state;

    return (
        <section className="calc-card">
            <h2 className="calc-title">Results</h2>
            <div id="output-container" style={{ display: "block", gridTemplateColumns: "1fr 1fr", gap: "14px"}}>
                <div>
                    <h2 className="calc-title-2 bon" style={{ display: "none" }}>without Bonferroni</h2>
                    <div className="calc-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                        <div className="calc-field">
                            <span className="calc-label">Estimated Test Average (μ₁)</span>
                            <div className="calc-output">{numeral(noBon.mu1).format("0,0.00")}</div>
                        </div>
                        <div className="calc-field">
                            <span className="calc-label">Sample Size per Recipe (n)</span>
                            <div className="calc-output">{numeral(noBon.perRecipe).format("0,0")}</div>
                        </div>
                        <div className="calc-field">
                            <span className="calc-label">Total Sample Size (N)</span>
                            <div className="calc-output">{numeral(noBon.total).format("0,0")}</div>
                        </div>
                        <div className="calc-field">
                            <span className="calc-label">Estimated Duration (days)</span>
                            <div className="calc-output">{numeral(noBon.duration).format("0,0")}</div>
                        </div>
                    </div>
                </div>
                <div className="bon" style={{ display: "none" }}>
                    <h2 className="calc-title-2">With Bonferroni</h2>
                    <div className="calc-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                        <div className="calc-field">
                            <span className="calc-label">Estimated Test Average (μ₁)</span>
                            <div className="calc-output">{numeral(bon.mu1).format("0,0.00")}</div>
                        </div>
                        <div className="calc-field">
                            <span className="calc-label">Sample Size per Recipe (n)</span>
                            <div className="calc-output">{numeral(bon.perRecipe).format("0,0")}</div>
                        </div>
                        <div className="calc-field">
                            <span className="calc-label">Total Sample Size (N)</span>
                            <div className="calc-output">{numeral(bon.total).format("0,0")}</div>
                        </div>
                        <div className="calc-field">
                            <span className="calc-label">Estimated Duration (days)</span>
                            <div className="calc-output">{numeral(bon.duration).format("0,0")}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CalculatorOutputs;