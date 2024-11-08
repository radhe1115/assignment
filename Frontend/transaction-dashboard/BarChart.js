import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

function BarChart({ month }) {
    const [chartData, setChartData] = useState({});

    useEffect(() => {
        fetch(`/api/barchart/${month}`)
            .then(res => res.json())
            .then(data => {
                const labels = data.map(item => item.range);
                const values = data.map(item => item.count);
                setChartData({
                    labels,
                    datasets: [{
                        label: 'Items per Price Range',
                        data: values,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    }]
                });
            });
    }, [month]);

    return <Bar data={chartData} />;
}

export default BarChart;
