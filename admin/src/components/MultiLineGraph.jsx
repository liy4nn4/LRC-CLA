
// LineChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  maintainAspectRatio: false, // Allow resizing to fit container
  interaction: {
    intersect: false,
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      grid: {
        drawOnChartArea: false,
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
    }
  },
};

const MultiLineGraph = ({ data }) => {
    return (
        <div id="chart-container">
            <h5>Borrowing Trends Per Week</h5>
            <Line options={options} data={data} />
        </div>
    );
};

export default MultiLineGraph;
