// <block:setup:1>
const DATA_COUNT = 12;
const labels = [];
for (let i = 0; i < DATA_COUNT; ++i) {
    labels.push(i.toString());
}
const datapoints = [0, 20, 20, 60, 60, 120, NaN, 180, 120, 125, 105, 110, 170];
const datapoints2 = [0, 15, 35, 40, 55, 80, 120, 130, 60, 125, 97, 120, 160];
const data = {
    labels: labels,
    datasets: [{
        label: '10.10.10.1',
        data: datapoints,
        borderColor: 'rgb(255, 99, 132)',
        fill: false,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
    }, {
        label: '10.10.10.2',
        data: datapoints,
        borderColor: 'rgb(54, 162, 235)',
        fill: false,
        tension: 0.4
    }, {
        label: '10.10.10.3',
        data: datapoints,
        borderColor: 'rgb(75, 192, 192)',
        fill: false,
        tension: 0.4
    }, {
        label: '10.10.10.4',
        data: datapoints,
        borderColor: 'rgb(64, 204, 255)',
        fill: false,
        tension: 0.4
    }, {
        label: '10.10.10.5',
        data: datapoints,
        borderColor: 'rgb(64, 255, 185)',
        fill: false,
        tension: 0.4
    }, {
        label: '10.10.10.6',
        data: datapoints,
        borderColor: 'rgb(198, 255, 64)',
        fill: false,
        tension: 0.4
    }, {
        label: '10.10.10.7',
        data: datapoints2,
        borderColor: 'rgb(255, 159, 64)',
        fill: false,
        tension: 0.4
    }, {
        label: '10.10.10.8',
        data: datapoints2,
        borderColor: 'rgb(255, 205, 86)',
        fill: false,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
    }, {
        label: '10.10.10.9',
        data: datapoints2,
        borderColor: 'rgb(153, 102, 255)',
        fill: false,
        tension: 0.4
    }, {
        label: '10.10.10.10',
        data: datapoints2,
        borderColor: 'rgb(201, 203, 207)',
        fill: false,
        tension: 0.4
    }]
};
// </block:setup>

// <block:config:0>
const config = {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        interaction: {
            intersect: false,
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Время'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Количество заверженных тасков'
                },
                suggestedMin: 0,
                suggestedMax: 200
            }
        }
    },
};
// </block:config>

// module.exports = {
//     actions: [],
//     config: config,
// };


const ctx = document.getElementById('myChart');
const myChart = new Chart(ctx, config)