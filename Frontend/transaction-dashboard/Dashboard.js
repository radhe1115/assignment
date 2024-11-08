import React, { useState } from 'react';
import TransactionTable from './TransactionTable';
import Statistics from './Statistics';
import BarChart from './BarChart';
import PieChart from './PieChart';

function Dashboard() {
    const [month, setMonth] = useState('March');

    return (
        <div>
            <h1>Transaction Dashboard</h1>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>
            <TransactionTable month={month} />
            <Statistics month={month} />
            <BarChart month={month} />
            <PieChart month={month} />
        </div>
    );
}

export default Dashboard;
