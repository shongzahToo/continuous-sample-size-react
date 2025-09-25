import { useEffect } from 'react';
import { createNumberInput } from 'smart-number-input';
import "../Calculator/Calculator.css";
import FileInputButton from '../FileInputButton/FileInputButton.js'

function HandleStats(stats) {
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
}


function CalculatorInputs() {
    useEffect(() => {
        let callbacks = [];
        callbacks.push(createNumberInput(document.getElementById("confidence"), {
            focusFormat: '0.[0000000000000]%',
            blurFormat: '[0].00[00]',
            allowNegative: false,
            min: .5,
            max: 1,
            stepValue: .01
        }));
        callbacks.push(createNumberInput(document.getElementById("power"), {
            focusFormat: '0.[0000000000000]%',
            blurFormat: '[0].00[00]',
            allowNegative: false,
            min: .8,
            max: 1,
            stepValue: .01
        }));
        callbacks.push(createNumberInput(document.getElementById("MDE"), {
            focusFormat: '0.[0000000000000]%',
            blurFormat: '[0].00[00]',
            min: -1,
            max: 1,
            stepValue: .01
        }));
        callbacks.push(createNumberInput(document.getElementById("numberOfInputVars"), {
            focusFormat: '0,0',
            blurFormat: '0,0',
            allowNegative: false,
            min: 1,
            stepValue: 1
        }));
        callbacks.push(createNumberInput(document.getElementById("mean"), {
            focusFormat: '0,0.[000000000000000]',
            blurFormat: '0,0.[00a]',
            allowNegative: false,
            min: 0,
            stepValue: 1
        }));
        callbacks.push(createNumberInput(document.getElementById("standardDeviation"), {
            focusFormat: '0,0.[000000000000000]',
            blurFormat: '0,0.[00a]',
            allowNegative: false,
            min: 0,
            stepValue: 1
        }));
        callbacks.push(createNumberInput(document.getElementById("dailyTraffic"), {
            focusFormat: '0,0.[000000000000000]',
            blurFormat: '0,0.[00a]',
            allowNegative: false,
            min: 0,
            stepValue: 1
        }));

        return (() => {
            callbacks.forEach(callback => {
                callback.destroy()
            })
        })
    }, []);

    return (
        <section className="calc-card calc-inputs">
            <div className="calc-title">Settings</div>
            <div className="calc-grid">
                <label className="calc-field">
                    <span className="calc-label">Confidence</span>
                    <input type="text" name="confidence" id="confidence" defaultValue={0.95} className="calc-input" />
                </label>

                <label className="calc-field">
                    <span className="calc-label">Power</span>
                    <input type="text" name="power" id="power" defaultValue={0.8} className="calc-input" />
                </label>

                <label className="calc-field">
                    <span className="calc-label">MDE</span>
                    <input type="text" name="MDE" id="MDE" defaultValue={0.05} className="calc-input" />
                </label>

                <label className="calc-field">
                    <span className="calc-label">Tails</span>
                    <div className="calc-select-wrap">
                        <select name="tails" id="tails" className="calc-select">
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                        </select>
                    </div>
                </label>

                <label className="calc-field">
                    <span className="calc-label"># of Variants (Exc. control)</span>
                    <input type="text" name="numberOfInputVars" id="numberOfInputVars" defaultValue={1} className="calc-input" />
                </label>

                <label className="calc-field">
                    <span className="calc-label">mean</span>
                    <input type="text" name="mean" id="mean" defaultValue={50} className="calc-input" />
                </label>

                <label className="calc-field">
                    <span className="calc-label">Std Dev</span>
                    <input type="text" name="standardDeviation" id="standardDeviation" defaultValue={180} className="calc-input" />
                </label>

                <label className="calc-field">
                    <span className="calc-label">Daily Traffic</span>
                    <input type="text" name="dailyTraffic" id="dailyTraffic" defaultValue={9500} className="calc-input" />
                </label>
            </div>
            <FileInputButton
                onStats={(stats) => { HandleStats(stats) }}
            ></FileInputButton>
        </section>
    );
}

export default CalculatorInputs;