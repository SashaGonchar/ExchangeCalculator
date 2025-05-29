import {useEffect, useState} from "react";
import "./index.css";

export default function App() {
    const [amount, setAmount] = useState('100');
    const [availableCurrency, setAvailableCurrency] = useState([]);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [outputAmount, setOutputAmount] = useState(
        null);
    const [displayedDots, setDisplayedDots] = useState(0)

    const handleChange = (e) => {
        setAmount(e.target.value);
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
        setOutputAmount(null);

        async function getData() {
            try {
                const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`, {signal});
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                setOutputAmount(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Ошибка при получении данных:', err);
                }
            }
        }

        const fetchData = async () => {
            if (fromCurrency !== toCurrency) {
                await getData();
            } else {
                setOutputAmount({ rates: { [toCurrency]: amount } });
            }
        };

        fetchData();

        return () => {
            controller.abort();
        };
    }, [amount, fromCurrency, toCurrency]);

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
    }, [outputAmount]);


    useEffect(() => {
        if (!outputAmount) {
            const interval = setInterval(() => {
                setDisplayedDots((prev) => (prev + 1) % 4);
            }, 100);

            return () => clearInterval(interval);
        }
    }, [outputAmount]);


    const currencyOptions = availableCurrency?.map((currency) => (
        <option key={currency} value={currency}>
            {currency}
        </option>
    ));


    return (
        <div className="app">
            <h1>Currency Exchange Calculator</h1>

            <div className="converter-container">
                <p className="error"></p>

                <div className="input-group">
                    <input type="number" placeholder="Amount" className="input-field" value={amount}
                           onChange={handleChange}/>
                    <select className="dropdown" name="from" value={fromCurrency} onChange={handleSelectedCurrency}>
                        {currencyOptions}
                    </select>
                    <span className="arrow">→</span>
                    <select className="dropdown" name="to" value={toCurrency} onChange={handleSelectedCurrency}>
                        {currencyOptions}
                    </select>
                </div>
                <button className="convert-button">Convert</button>
                <div className={"wrapper"}>
                    {!outputAmount && (

                        <p className="loading">Converting{".".repeat(displayedDots)}</p>
                    )}

                    {outputAmount && (
                        <p className="result">
                            {amount} {fromCurrency} = {outputAmount.rates[toCurrency]} {toCurrency}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}



