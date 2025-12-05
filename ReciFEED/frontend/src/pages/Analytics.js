import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../components/Analytics.css';
import LiveLineChart from '../components/LiveLineChart';
import PopularityChart from '../components/PopularityChart';
import RadioSelector from '../components/RadioSelector';

const Analytics = () => {
  const [selectedRange, setSelectedRange] = useState('day');

  const options = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' }
  ];

  return (
    <div>
      <div className='analytics-header'>
        Analytics Dashboard
      </div>
      <div className="analytics-container" >
        <div className='header'>
          Live Analytics
        </div>
        <div className='live-charts'>
          <LiveLineChart type="users" title="Current Active Users" axis="Users" />
          <LiveLineChart type="post-interactions" title="Live Post Interactions" axis="Interactions" />
          <LiveLineChart type="recipe-views" title="Live Recipe Views" axis="Views" />
        </div>
        <div className="aggregate-charts">
          <div className='aggregate-selector'>
            <div className='header'>
              Aggregate Analytics
            </div>
            <RadioSelector options={options} selected={selectedRange} setSelected={setSelectedRange}/>
          </div>
          <div className='popularity-charts'>
            <PopularityChart type="recipes" range={selectedRange} title="Most Popular Recipes" axis="Views" />
            <PopularityChart type="search" range={selectedRange} title="Most Popular Search Terms" axis="Frequency" />
            <PopularityChart type="posts" range={selectedRange} title="Most Popular Posts" axis="Interactions" />
            <PopularityChart type="users" range={selectedRange} title="Most Popular User Pages" axis="Views" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
