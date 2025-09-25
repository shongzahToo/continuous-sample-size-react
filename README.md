<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="./public/favicon.ico" alt="Project logo"></a>
</p>

<h3 align="center">Continuous Sample Size Calculator</h3>

---

<p align="center"> 
  This is a work in progress calculator for A/B tests on continuous metrics.
    <br> 
</p>

## 📝 Table of Contents

- [Usage](#usage)
- [TODO](../TODO.md)
- [Built Using](#built_using)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)


## Usage <a name = "usage"></a>
select the desired confidence level, statistical power, and minimum detectable effect (MDE), then choose whether it’s a one- or two-tailed test. Enter the number of variants (excluding the control), along with your baseline mean, standard deviation, and daily traffic. Once these values are set, the calculator will compute the required sample size per variant, the total sample size, and the estimated duration needed for your test, showing results both with and without a Bonferroni correction. This helps you quickly determine how long your experiment will take and how many samples you need to confidently detect meaningful differences.


## TODO <a name = "TODO"></a>
- Add a table to display possible outputs given varied inputs
- Add explanatory tooltips
- Add examples
- Provide warnings under certain conditions
- Update field names for clarification

## Built Using <a name = "built_using"></a>

- [React](https://www.npmjs.com/package/react) - Web Framework
- [Numeral](https://www.npmjs.com/package/numeral) - Numeric Formating
- [smart-number-input](https://www.npmjs.com/package/smart-number-input) - Easy Numeric Inputs

## Authors <a name = "authors"></a>

- [@ShongzahToo](https://github.com/shongzahToo)


## Acknowledgements <a name = "acknowledgement"></a>

- [@Geoffrey Wortham](https://www.linkedin.com/in/geoffreywortham/) - Author 
- [@Merritt Aho](https://www.linkedin.com/in/merrittaho/) - Provided the Math