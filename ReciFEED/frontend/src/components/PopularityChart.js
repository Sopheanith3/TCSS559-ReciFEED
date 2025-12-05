import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { analyticsService } from '../services/analyticsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PopularityChart = ({ type, range, title, axis }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        label: axis,
        backgroundColor: 'rgb(226, 117, 77, 0.7)',
        borderColor: 'rgb(226, 117, 77)',
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await analyticsService.getPopular(type, range);

        setChartData({
          labels: results.map(result => result.label ?? result.term),
          datasets: [
            {
              ...chartData.datasets[0],
              data: results.map(item => item.count),
            },
          ],
        });
      } catch (error) {
        console.log(`Error fetching popular ${type} data for ${range}:`, error)
      }
    };

    fetchData();
  }, [range, type]);

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 18
        }
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: axis,
          font: {
            size: 14
          }
        },
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
      y: {
        font: {
          size: 14
        }
      }
    },
  };

  return (
    <div style={{ width: '80%', margin: 'auto', minHeight: '225px', maxWidth: '600px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default PopularityChart;