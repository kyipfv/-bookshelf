import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function StatsCard({ stats }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Fiction', 'History', 'Non-Fiction', 'Uncategorized'],
          datasets: [{
            label: 'Books',
            data: [stats.fiction, stats.history, stats.nonFiction, stats.uncategorized],
            backgroundColor: [
              '#1e88e5',
              '#43a047',
              '#fb8c00',
              '#9e9e9e'
            ],
            borderWidth: 0,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.parsed.y} books`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [stats]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Library Statistics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Books</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{stats.fiction}</p>
          <p className="text-sm text-gray-600">Fiction</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{stats.history}</p>
          <p className="text-sm text-gray-600">History</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-orange-600">{stats.nonFiction}</p>
          <p className="text-sm text-gray-600">Non-Fiction</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-500">{stats.uncategorized}</p>
          <p className="text-sm text-gray-600">Uncategorized</p>
        </div>
      </div>

      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}

export default StatsCard;