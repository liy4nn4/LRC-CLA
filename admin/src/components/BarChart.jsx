import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  maintainAspectRatio: false, // Allow resizing to fit container
  plugins: {
    legend: {
      position: 'bottom',
    }
  },
};

const BarChart = ({data}) => {
  return (
    <div id="chart-container">
        <h5>Visitor Statistics Per Week</h5>
        <Bar options={options} data={data} />;
    </div>
);
}

export default BarChart
