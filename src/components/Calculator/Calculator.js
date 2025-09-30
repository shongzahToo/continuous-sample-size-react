import CalculatorInputs from '../CalculatorInputs/CalculatorInputs.js';
import CalculatorOutputs from '../CalculatorOutputs/CalculatorOutputs.js';

function Calculator() {
    return (
        <div className='calculator-container center'>
            <div className='calc-main-title'>Continuous Sample Size Calculator</div>
            <p>Quickly estimate the sample size required for continuous metrics</p>
            <i><p class="thanks">Special thanks to <a href="https://www.linkedin.com/in/geoffreywortham/" target="_blank" rel='noreferrer'>Geoffrey Wortham</a> for his work creating this calculator <br />
                and to <a href="https://www.linkedin.com/in/merrittaho/" target="_blank" rel='noreferrer'>Merritt Aho</a> for his support with the calculations</p></i>
            <i><p class="thanks">Any and all <a href="https://docs.google.com/forms/d/e/1FAIpQLSeCGQNflPMnPMawIlAK3LjZ3Cq1xU4pRqA17pSNwXvy-VCivQ/viewform?usp=sharing&ouid=116690262569406278310" target="_blank" rel='noreferrer'>feedback</a> is appreciated!</p></i>
            <CalculatorInputs></CalculatorInputs>
            <CalculatorOutputs></CalculatorOutputs>
            <iframe src="./TheMath.pdf" id="math-iframe" title="MathIFrame"></iframe>
        </div>
    )
}

export default Calculator;