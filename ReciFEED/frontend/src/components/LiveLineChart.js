import React, { useState, useEffect } from 'react';
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
import { analyticsService } from '../services/analyticsService';

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LiveLineChart = ({type, title, axis}) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: 'rgb(226, 117, 77)',
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    const fetchAndUpdate = async () => {
      // Default 0 if no data received
      let newDataPoint = 0;
      try {
        newDataPoint = await analyticsService.getLive(type);
      } catch {
        // If error, keep as last data value
        setChartData((prevData) => {
          if (prevData.datasets && prevData.datasets[0]?.data.length > 0) {
            newDataPoint = prevData.datasets[0].data[prevData.datasets[0].data.length - 1];
          }
          return prevData;
        });
      }

      const newLabel = new Date().toLocaleTimeString();

      // Update state with new data (synchronous)
      setChartData((prevData) => {
        const newLabels = [...prevData.labels, newLabel];
        const newData = [...prevData.datasets[0].data, newDataPoint];

        // Keep a limited number of data points for better visualization
        const maxDataPoints = 15;
        if (newLabels.length > maxDataPoints) {
          newLabels.shift();
          newData.shift();
        }

        return {
          labels: newLabels,
          datasets: [
            {
              ...prevData.datasets[0],
              data: newData,
            },
          ],
        };
      });
    };

    // Call immediately on mount
    fetchAndUpdate();
    
    // Set up interval
    const interval = setInterval(fetchAndUpdate, 3000);

    return () => clearInterval(interval);
  }, [type]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 18,
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 14
          }
        },
      },
      y: {
        title: {
          display: true,
          text: axis,
          font: {
            size: 14
          }
        },
        min: 0,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: '80%', margin: 'auto', minHeight: '300px', maxWidth: '700px' }}>
      <Line data={chartData} options={options}/>
    </div>
  );
};

export default LiveLineChart;