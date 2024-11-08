import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';

function PieChart({ month }) {
    const [chartData, setChartData] = useState({});

    useEffect(() => {
        fetch(`/api/piechart/${month}`)
            .then(res => res.json())
            .then(data => {
                const labels = data.map(item => item.category);
                const values = data.map(item => item.count);
                setChartData({
                    labels,
                    datasets: [{
                        label: 'Items per Category',
                        data: values,
                        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
                    }]
                });
            });
    }, [month]);

    return <Pie data={chartData} />;
}

export default PieChart;
