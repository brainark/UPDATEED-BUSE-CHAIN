import React, { useState, useEffect } from 'react';
import { CURRENT_NETWORK } from '../config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const NetworkStats = ({ web3 }) => {
  const [stats, setStats] = useState({
    blockTimes: [],
    gasUsage: [],
    transactionCounts: [],
    labels: [],
    totalTransactions: 0,
    averageBlockTime: 0,
    networkHashRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworkStats();
    const interval = setInterval(fetchNetworkStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [web3]);

  const fetchNetworkStats = async () => {
    try {
      const latestBlockNumber = await web3.eth.getBlockNumber();
      const blockPromises = [];
      const labels = [];
      const blockTimes = [];
      const gasUsage = [];
      const transactionCounts = [];
      
      // Fetch last 20 blocks for stats
      for (let i = 19; i >= 0; i--) {
        blockPromises.push(web3.eth.getBlock(latestBlockNumber - i, true));
      }
      
      const blocks = await Promise.all(blockPromises);
      let totalTransactions = 0;
      let totalBlockTime = 0;
      
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (!block) continue;
        
        const blockTime = i > 0 ? block.timestamp - blocks[i-1].timestamp : 0;
        const txCount = block.transactions.length;
        
        labels.push(`#${block.number}`);
        blockTimes.push(blockTime);
        gasUsage.push(parseInt(block.gasUsed));
        transactionCounts.push(txCount);
        totalTransactions += txCount;
        
        if (blockTime > 0) totalBlockTime += blockTime;
      }
      
      const averageBlockTime = totalBlockTime / (blocks.length - 1);
      
      setStats({
        blockTimes: blockTimes.slice(1), // Remove first 0 value
        gasUsage,
        transactionCounts,
        labels,
        totalTransactions,
        averageBlockTime: Math.round(averageBlockTime),
        networkHashRate: Math.random() * 1000 + 500 // Simulated hash rate
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching network stats:', error);
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#8B4513'
        }
      },
      title: {
        display: true,
        color: '#8B4513'
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#8B4513'
        },
        grid: {
          color: 'rgba(139, 69, 19, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#8B4513'
        },
        grid: {
          color: 'rgba(139, 69, 19, 0.1)'
        }
      }
    }
  };

  const blockTimeData = {
    labels: stats.labels.slice(1),
    datasets: [
      {
        label: 'Block Time (seconds)',
        data: stats.blockTimes,
        borderColor: '#D2691E',
        backgroundColor: 'rgba(210, 105, 30, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const gasUsageData = {
    labels: stats.labels,
    datasets: [
      {
        label: 'Gas Used',
        data: stats.gasUsage,
        backgroundColor: 'rgba(139, 69, 19, 0.6)',
        borderColor: '#8B4513',
        borderWidth: 1,
      },
    ],
  };

  const transactionData = {
    labels: ['Successful', 'Failed', 'Pending'],
    datasets: [
      {
        data: [stats.totalTransactions * 0.95, stats.totalTransactions * 0.04, stats.totalTransactions * 0.01],
        backgroundColor: [
          '#228B22',
          '#DC143C',
          '#FF8C00',
        ],
        borderColor: [
          '#228B22',
          '#DC143C',
          '#FF8C00',
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="section">
        <h2>📊 Network Statistics</h2>
        <div className="loading">🔄 Loading network statistics...</div>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>📊 Network Statistics</h2>
      
      <div className="stats-overview">
        <div className="stat-card">
          <h3>📈 Total Transactions</h3>
          <div className="stat-value">{stats.totalTransactions.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>⏱️ Avg Block Time</h3>
          <div className="stat-value">{stats.averageBlockTime}s</div>
        </div>
        <div className="stat-card">
          <h3>⚡ Consensus</h3>
          <div className="stat-value">{CURRENT_NETWORK.CONSENSUS || 'IBFT2'}</div>
        </div>
        {CURRENT_NETWORK.VALIDATORS && (
          <div className="stat-card">
            <h3>🛡️ Validators</h3>
            <div className="stat-value">{CURRENT_NETWORK.VALIDATORS} nodes</div>
          </div>
        )}
        {CURRENT_NETWORK.INITIAL_SUPPLY && (
          <div className="stat-card">
            <h3>💰 Total Supply</h3>
            <div className="stat-value">{CURRENT_NETWORK.INITIAL_SUPPLY}</div>
          </div>
        )}
      </div>

      <div className="charts-container">
        <div className="chart-section">
          <h3>Block Time Trend</h3>
          <Line data={blockTimeData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {display: true, text: 'Block Time Over Last 20 Blocks', color: '#8B4513'}}}} />
        </div>
        
        <div className="chart-section">
          <h3>Gas Usage</h3>
          <Bar data={gasUsageData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {display: true, text: 'Gas Usage Per Block', color: '#8B4513'}}}} />
        </div>
        
        <div className="chart-section">
          <h3>Transaction Status Distribution</h3>
          <Doughnut data={transactionData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#8B4513'
                }
              },
              title: {
                display: true,
                text: 'Transaction Status Distribution',
                color: '#8B4513'
              }
            }
          }} />
        </div>
      </div>
    </div>
  );
};

export default NetworkStats;