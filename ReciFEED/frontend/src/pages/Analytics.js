import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../components/Analytics.css';
import LiveLineChart from '../components/LiveLineChart';

const Analytics = () => {
  return (
    <div className="analytics-page">
      <LiveLineChart type="users"/>
    </div>
  );
};

export default Analytics;
