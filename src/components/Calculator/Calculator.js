import FileInputButton from '../FileInputButton/FileInputButton.js';
import { createNumberInput } from 'smart-number-input';
import { useLayoutEffect, useState } from 'react';
import numeral from "numeral";
import './Calculator.css'

const HandleStats = (stats) => {
    const sd = document.getElementById("standardDeviation");
    const mean = document.getElementById("mean");

    sd.value = stats.stdev;
    mean.value = stats.mean;

    const highlight = '0 0 0 4px color-mix(in srgb, #7c3aed 18%, transparent)';
    sd.style.borderColor = '#7c3aed';
    mean.style.borderColor = '#7c3aed';
    sd.style.boxShadow = highlight;
    mean.style.boxShadow = highlight;

    setTimeout(() => {
        sd.style.removeProperty('box-shadow');
        mean.style.removeProperty('box-shadow');
        sd.style.removeProperty('border-color');
        mean.style.removeProperty('border-color');
    }, 250);
};

const erf = (x) => {
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
    const p = 0.3275911;
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
    return sign * y;
};

const normInv = (p) => {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const a1 = -39.69683028665376, a2 = 220.9460984245205, a3 = -275.9285104469687, a4 = 138.3577518672690, a5 = -30.66479806614716, a6 = 2.506628277459239;
    const b1 = -54.47609879822406, b2 = 161.5858368580409, b3 = -155.6989798598866, b4 = 66.80131188771972, b5 = -13.28068155288572;
    const c1 = -0.007784894002430293, c2 = -0.3223964580411365, c3 = -2.400758277161838, c4 = -2.549732539343734, c5 = 4.374664141464968, c6 = 2.938163982698783;
    const d1 = 0.007784695709041462, d2 = 0.3224671290700398, d3 = 2.445134137142996, d4 = 3.754408661907416;
    const plow = 0.02425, phigh = 1 - plow;
    let q, r, x;
    if (p < plow) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1); }
    else if (p > phigh) { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1); }
    else { q = p - 0.5; r = q * q; x = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1); }
    const e = 0.5 * (1 + erf(x / Math.SQRT2)) - p;
    const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
    x = x - u / (1 + (x * u) / 2);
    return x;
};

const calcAll = () => {
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
        ![1, 2].includes(T) || K < 0 || sigma < 0 || mu0 < 0 || daily <= 0
    ) return null;

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
};

const handleTestVars = (v) => {
    if (v > 1) {
        Array.from(document.querySelectorAll(".bon")).forEach(el => { el.style.display = "block"; });
        document.getElementById("output-container").style.display = "grid";
    } else {
        Array.from(document.querySelectorAll(".bon")).forEach(el => { el.style.display = "none"; });
        document.getElementById("output-container").style.display = "block";
    }
};

function Calculator() {
    const [state, setState] = useState(null);

    useLayoutEffect(() => {
        const ids = ["confidence", "power", "MDE", "mean", "standardDeviation", "dailyTraffic", "numberOfInputVars", "tails"];
        if (!ids.every(id => document.getElementById(id))) return;

        const callbacks = [];
        callbacks.push(createNumberInput(document.getElementById("confidence"), {
            focusFormat: '0.[0000000000000]%',
            blurFormat: '[0].00[00]',
            allowNegative: false, min: .5, max: 1, stepValue: .01,
            onValueChange: () => setState(calcAll())
        }));
        callbacks.push(createNumberInput(document.getElementById("power"), {
            focusFormat: '0.[0000000000000]%',
            blurFormat: '[0].00[00]',
            allowNegative: false, min: .8, max: 1, stepValue: .01,
            onValueChange: () => setState(calcAll())
        }));
        callbacks.push(createNumberInput(document.getElementById("MDE"), {
            focusFormat: '0.[0000000000000]%',
            blurFormat: '[0].00[00]',
            min: -1, max: 1, stepValue: .01,
            onValueChange: () => setState(calcAll())
        }));
        callbacks.push(createNumberInput(document.getElementById("numberOfInputVars"), {
            focusFormat: '0,0', blurFormat: '0,0',
            allowNegative: false, min: 1, stepValue: 1,
            onValueChange: (v) => { setState(calcAll()); handleTestVars(v); }
        }));
        callbacks.push(createNumberInput(document.getElementById("mean"), {
            focusFormat: '0,0.[000000000000000]',
            blurFormat: '0,0.[00a]',
            allowNegative: false, min: 0, stepValue: 1,
            onValueChange: () => setState(calcAll())
        }));
        callbacks.push(createNumberInput(document.getElementById("standardDeviation"), {
            focusFormat: '0,0.[000000000000000]',
            blurFormat: '0,0.[00a]',
            allowNegative: false, min: 0, stepValue: 1,
            onValueChange: () => setState(calcAll())
        }));
        callbacks.push(createNumberInput(document.getElementById("dailyTraffic"), {
            focusFormat: '0,0.[000000000000000]',
            blurFormat: '0,0.[00a]',
            allowNegative: false, min: 0, stepValue: 1,
            onValueChange: () => setState(calcAll())
        }));

        const tails = document.getElementById("tails");
        const onTailsChange = () => setState(calcAll());
        if (tails) tails.addEventListener("change", onTailsChange);

        const raf = requestAnimationFrame(() => setState(calcAll()));

        return () => {
            cancelAnimationFrame(raf);
            if (tails) tails.removeEventListener("change", onTailsChange);
            callbacks.forEach(cb => cb?.destroy && cb.destroy());
        };
    }, []);

    const { noBon, bon } = state || {};

    return (
        <div className='calculator-container center'>
            <div className='calc-main-title'>Continuous Sample Size Calculator</div>
            <p>Quickly estimate the sample size required for continuous metrics</p>
            <i><p className="thanks">Special thanks to <a href="https://www.linkedin.com/in/geoffreywortham/" target="_blank" rel='noreferrer'>Geoffrey Wortham</a> for his work creating this calculator <br />
                and to <a href="https://www.linkedin.com/in/merrittaho/" target="_blank" rel='noreferrer'>Merritt Aho</a> for his support with the calculations</p></i>
            <i><p className="thanks">Any and all <a href="https://docs.google.com/forms/d/e/1FAIpQLSeCGQNflPMnPMawIlAK3LjZ3Cq1xU4pRqA17pSNwXvy-VCivQ/viewform?usp=sharing&ouid=116690262569406278310" target="_blank" rel='noreferrer'>feedback</a> is appreciated!</p></i>

            <section className="calc-card calc-inputs">
                <div className="calc-title">Settings</div>
                <div className="calc-grid">
                    <label className="calc-field">
                        <span className="calc-label">Confidence</span>
                        <input type="text" id="confidence" defaultValue={0.95} className="calc-input" />
                    </label>
                    <label className="calc-field">
                        <span className="calc-label">Power</span>
                        <input type="text" id="power" defaultValue={0.8} className="calc-input" />
                    </label>
                    <label className="calc-field">
                        <span className="calc-label">MDE</span>
                        <input type="text" id="MDE" defaultValue={0.05} className="calc-input" />
                    </label>
                    <label className="calc-field">
                        <span className="calc-label">Tails</span>
                        <div className="calc-select-wrap">
                            <select id="tails" className="calc-select">
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                            </select>
                        </div>
                    </label>
                    <label className="calc-field">
                        <span className="calc-label"># of Recipes (Exc. control)</span>
                        <input type="text" id="numberOfInputVars" defaultValue={1} className="calc-input" />
                    </label>
                    <label className="calc-field">
                        <span className="calc-label">mean</span>
                        <input type="text" id="mean" defaultValue={50} className="calc-input" />
                    </label>
                    <label className="calc-field">
                        <span className="calc-label">Std Dev</span>
                        <input type="text" id="standardDeviation" defaultValue={180} className="calc-input" />
                    </label>
                    <label className="calc-field">
                        <span className="calc-label">Daily Traffic</span>
                        <input type="text" id="dailyTraffic" defaultValue={9500} className="calc-input" />
                    </label>
                </div>

                <FileInputButton onStats={(stats) => { HandleStats(stats); setState(calcAll()); }} />
            </section>

            {!state && (
                <section className="calc-card">
                    <h2 className="calc-title">Results</h2>
                    <div className="calc-grid">
                        <div className="calc-field"><span className="calc-label">Estimated Test Average</span><div className="calc-output">—</div></div>
                        <div className="calc-field"><span className="calc-label">Sample Size per Recipe</span><div className="calc-output">—</div></div>
                        <div className="calc-field"><span className="calc-label">Total Sample Size</span><div className="calc-output">—</div></div>
                        <div className="calc-field"><span className="calc-label">Estimated Duration (days)</span><div className="calc-output">—</div></div>
                    </div>
                </section>
            )}

            {state && (
                <section className="calc-card">
                    <h2 className="calc-title">Results</h2>
                    <div id="output-container" style={{ display: "block", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <div>
                            <h2 className="calc-title-2 bon" style={{ display: "none" }}>without Bonferroni</h2>
                            <div className="calc-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                                <div className="calc-field"><span className="calc-label">Estimated Test Average (μ₁)</span><div className="calc-output">{numeral(noBon.mu1).format("0,0.00")}</div></div>
                                <div className="calc-field"><span className="calc-label">Sample Size per Recipe (n)</span><div className="calc-output">{numeral(noBon.perRecipe).format("0,0")}</div></div>
                                <div className="calc-field"><span className="calc-label">Total Sample Size (N)</span><div className="calc-output">{numeral(noBon.total).format("0,0")}</div></div>
                                <div className="calc-field"><span className="calc-label">Estimated Duration (days)</span><div className="calc-output">{numeral(noBon.duration).format("0,0")}</div></div>
                            </div>
                        </div>
                        <div className="bon" style={{ display: "none" }}>
                            <h2 className="calc-title-2">With Bonferroni</h2>
                            <div className="calc-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                                <div className="calc-field"><span className="calc-label">Estimated Test Average (μ₁)</span><div className="calc-output">{numeral(bon.mu1).format("0,0.00")}</div></div>
                                <div className="calc-field"><span className="calc-label">Sample Size per Recipe (n)</span><div className="calc-output">{numeral(bon.perRecipe).format("0,0")}</div></div>
                                <div className="calc-field"><span className="calc-label">Total Sample Size (N)</span><div className="calc-output">{numeral(bon.total).format("0,0")}</div></div>
                                <div className="calc-field"><span className="calc-label">Estimated Duration (days)</span><div className="calc-output">{numeral(bon.duration).format("0,0")}</div></div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <iframe src="./TheMath.pdf" id="math-iframe" title="MathIFrame"></iframe>
        </div>
    );
}

export default Calculator;
