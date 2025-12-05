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

const getNextValue = async (type, lastValue) => {
  const url = `http://localhost:3081/live?type=${type}`;
  const response = await fetch(url);

  if (!response.ok) {
    // Error retrieval, just keep last value
    return lastValue;
  }

  const data = await response.json();

  console.log(data)
  return data.count;
}

const LiveLineChart = ({type}) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Live Data',
        data: [],
        borderColor: 'rgb(226, 117, 77)',
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    const fetchAndUpdate = async () => {
      // Get the last value from current state
      let lastValue = 0;
      setChartData((prevData) => {
        if (prevData.datasets && prevData.datasets[0]?.data.length > 0) {
          lastValue = prevData.datasets[0].data[prevData.datasets[0].data.length - 1];
        }
        return prevData;
      });

      // Fetch new data
      const newDataPoint = await getNextValue(type, lastValue);
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
    plugins: {
      title: {
        display: true,
        text: 'Current Live Users',
        font: {
          size: 24,
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
        },
      },
      y: {
        title: {
          display: true,
          text: 'Users',
        },
        min: 0,
        ticks: {
          // Force integer ticks
          stepSize: 1,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: '80%', margin: 'auto' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LiveLineChart;