import React, { useState, useEffect } from 'react';

function Statistics({ month }) {
    const [stats, setStats] = useState({ totalSoldItems: 0, totalNotSoldItems: 0, totalSalesAmount: 0 });

    useEffect(() => {
        fetch(`/api/statistics/${month}`)
            .then(res => res.json())
            .then(data => setStats(data));
    }, [month]);

    return (
        <div>
            <h3>Statistics - {month}</h3>
            <p>Total Sale: {stats.totalSalesAmount}</p>
            <p>Total Sold Items: {stats.totalSoldItems}</p>
            <p>Total Not Sold Items: {stats.totalNotSoldItems}</p>
        </div>
    );
}

export default Statistics;
