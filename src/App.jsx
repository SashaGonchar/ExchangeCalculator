import { useEffect, useState } from "react";

export default function App() {
    const [amount, setAmount] = useState('100');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [outputAmount, setOutputAmount] = useState(null);

    const handleChange = (e) => {
        setAmount(e.target.value);
    }

    const handleSelectedCurrency = (e) => {
        const { name, value } = e.target;
        if (name === 'from') {
            setFromCurrency(value);
        } else if (name === 'to') {
            setToCurrency(value);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        async function getData() {
            try {
                const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`, { signal });
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                setOutputAmount(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Ошибка при получении данных:', err);
                }
            }
        }

        if (fromCurrency !== toCurrency) {
            getData();
        }

        return () => {
            controller.abort();
        };
    }, [amount, fromCurrency, toCurrency]);

    return (
        <div>
            <input type="text" value={amount} onChange={handleChange} />
            <select name="from" value={fromCurrency} onChange={handleSelectedCurrency}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="INR">INR</option>
            </select>
            <select name="to" value={toCurrency} onChange={handleSelectedCurrency}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="INR">INR</option>
            </select>
            {outputAmount && (
                <p>
                    {amount} {fromCurrency} = {outputAmount.rates[toCurrency]} {toCurrency}
                </p>
            )}
        </div>
    );
}