import {useEffect, useState} from "react";
import "./index.css";

export default function App() {
    const [availableCurrency, setAvailableCurrency] = useState([]);
    const [amount, setAmount] = useState(100);
    const [outputFromAmount, setOutputFromAmount] = useState(
        null);
    const [outputToAmount, setOutputToAmount] = useState(
        null);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [outputFromCurrency, setOutputFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [outputToCurrency, setOutputToCurrency] = useState('EUR');
    const [displayedDots, setDisplayedDots] = useState(0);
    const [click, setClick] = useState(true)

    const handleAmountChange = (e) => {
        if(Number(e.target.value) < 0){
            setAmount(0);
        }
        else if (Number(e.target.value) >= 0 )
        {setAmount(Number(e.target.value));}

    }

    const handleSelectedCurrency = (e) => {
        const {name, value} = e.target;
        if (name === 'from') {
            setFromCurrency(value);
        } else if (name === 'to') {
            setToCurrency(value);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        setOutputToAmount(null);

        async function getData() {
            try {
                const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`, {signal});
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                setOutputFromAmount(amount);
                setOutputFromCurrency(fromCurrency);
                setOutputToAmount(data);
                setOutputToCurrency(toCurrency);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Ошибка при получении данных:', err);
                }
            }
        }

        const fetchData = async () => {
            if (fromCurrency !== toCurrency && amount > 0) {
                await getData();
            } else {
                setOutputFromAmount(amount);
                setOutputFromCurrency(fromCurrency);
                setOutputToAmount({ rates: { [toCurrency]: amount } });
                setOutputToCurrency(toCurrency);
            }
        };

        fetchData();

        return () => {
            controller.abort();
        };
    }, [click]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        async function getCurrencies() {
            try {
                const res = await fetch(`https://api.frankfurter.dev/v1/currencies`, {signal});
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                setAvailableCurrency(Object.keys(data));
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Ошибка при получении данных:', err);
                }
            }
        }

        getCurrencies()

        return () => {
            controller.abort();
        };
    }, []);


    useEffect(() => {
        if (!outputToAmount) {
            const interval = setInterval(() => {
                setDisplayedDots((prev) => (prev + 1) % 4);
            }, 100);

            return () => clearInterval(interval);
        }
    }, [outputToAmount]);

    const currencyOptions = availableCurrency?.map((currency) => (
        <option key={currency} value={currency}>
            {currency}
        </option>
    ));

    const handleClick = () => {
        setClick(!click)
    }


    useEffect(() => {
        const timeout = setTimeout(() => {
            handleClick()
        }, 1500);

        return () => {
            clearTimeout(timeout);
        };
    }, [amount, fromCurrency, toCurrency]);


    return (
        <div className="app">
            <h1>Currency Exchange Calculator</h1>

            <div className="converter-container">
                <p className="error"></p>

                <div className="input-group">
                    <input type="number" min={0} placeholder="Amount" className="input-field" value={amount}
                           onChange={handleAmountChange}/>
                    <select className="dropdown" name="from" value={fromCurrency} onChange={handleSelectedCurrency}>
                        {currencyOptions}
                    </select>
                    <span className="arrow">→</span>
                    <select className="dropdown" name="to" value={toCurrency} onChange={handleSelectedCurrency}>
                        {currencyOptions}
                    </select>
                </div>
                <button className="convert-button" onClick={handleClick}>Convert</button>
                <div className={"wrapper"}>
                    {!outputToAmount && (
                        <p className="loading">Converting{".".repeat(displayedDots)}</p>
                    )}

                    {outputToAmount && (
                        <p className="result">
                            {outputFromAmount} {outputFromCurrency} = {outputToAmount.rates[outputToCurrency]} {outputToCurrency}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}



