import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Metrics() {
  const token = localStorage.getItem('token');
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  const chartColors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796', '#f8f9fc', '#5a5c69'];

  useEffect(() => {
    fetch('/api/metrics/summary', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Could not compile active operational records.");
        return res.json();
      })
      .then(data => setMetrics(data))
      .catch(err => setError(err.message));
  }, [token]);

  if (!metrics) return <div className="metrics-page-wrapper">Building statistical engine profiles...</div>;

  const subjectsList = metrics.subjects || [];
  const revenueRankList = metrics.revenue_ranking || [];
  const minutesRankList = metrics.minutes_ranking || [];

  const totalSessionsCount = subjectsList.reduce((sum, s) => sum + (s.sessions || 0), 0);
  let accumulatedPercentage = 0;
  
  const conicGradientSlices = subjectsList.length > 0 && totalSessionsCount > 0
    ? subjectsList.map((sub, i) => {
        const percentage = (sub.sessions / totalSessionsCount) * 100;
        const color = chartColors[i % chartColors.length];
        const start = accumulatedPercentage;
        accumulatedPercentage += percentage;
        return `${color} ${start}% ${accumulatedPercentage}%`;
      }).join(', ')
    : '';

  const pieChartStyle = {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: conicGradientSlices ? `conic-gradient(${conicGradientSlices})` : '#e9ecef',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  };

  return (
    <div className="metrics-page-wrapper">
      
      <header className="metrics-header">
        <h1>TutorBank Operations Dashboard (Current Month)</h1>
      </header>

      {error && <p className="metrics-text-error">{error}</p>}
      <div className="metrics-grid-layout">
        
        <div className="metrics-table-section">
          <h3>💰 Monthly Revenue Report</h3>
          <p className="metrics-card-text"><strong>Total Revenue:</strong> ${metrics.total_revenue || '0.00'}</p>
          <p className="metrics-card-text"><strong>Average Revenue Per Session:</strong> ${metrics.avg_revenue_per_session || '0.00'}</p>
          
          <div className="metrics-ranking-box">
            <h4 className="metrics-ranking-title-blue">🏆 Top 10 Revenue Rankings</h4>
            {revenueRankList.length === 0 ? <p className="metrics-ranking-empty">No records found.</p> : 
              <ol className="metrics-ranking-list">
                {revenueRankList.map((student, idx) => (
                  <li key={idx}><strong>{student.name}</strong> : ${student.revenue}</li>
                ))}
              </ol>
            }
          </div>
        </div>

        <div className="metrics-table-section">
          <h3>⏱️ Monthly Minutes Report</h3>
          <p className="metrics-card-text"><strong>Total Sessions Logged:</strong> {metrics.total_sessions || 0} sessions</p>
          <p className="metrics-card-text"><strong>Total Minutes Logged:</strong> {metrics.total_minutes || 0} mins</p>
          <p className="metrics-card-text"><strong>Average Session Length:</strong> {metrics.avg_duration || '0.00'} mins</p>

          <div className="metrics-ranking-box">
            <h4 className="metrics-ranking-title-green">⚡ Top 10 Most Minutes Logged</h4>
            {minutesRankList.length === 0 ? <p className="metrics-ranking-empty">No records found.</p> : 
              <ol className="metrics-ranking-list">
                {minutesRankList.map((student, idx) => (
                  <li key={idx}><strong>{student.name}</strong> : {student.minutes} mins</li>
                ))}
              </ol>
            }
          </div>
        </div>

      </div>

      <div className="metrics-subject-section">
        <h3 className="metrics-subject-title">📊 Sessions By Subject</h3>
        {subjectsList.length === 0 || totalSessionsCount === 0 ? (
          <p className="metrics-subject-empty">No sessions logged during the active monthly tracking period.</p>
        ) : (
          <div className="metrics-pie-container">
            <div style={pieChartStyle} />
            <div className="metrics-pie-legend">
              {subjectsList.map((sub, i) => (
                <div key={i} className="metrics-legend-row">
                  <div className="metrics-legend-color-box" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
                  <strong>{sub.subject.replace(/_/g, ' ')}:</strong> {sub.sessions} sessions ({((sub.sessions / totalSessionsCount) * 100).toFixed(1)}%)
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="metrics-table-section">
        <h3>📚 Monthly Sessions Report</h3>
        <table className="metrics-table">
          <thead>
            <tr className="metrics-table-head-row">
              <th className="metrics-table-th">Subject Tracking Domain</th>
              <th className="metrics-table-th">Total Session Counts</th>
              <th className="metrics-table-th">Average Length of Session</th>
              <th className="metrics-table-th">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {subjectsList.length === 0 ? (
              <tr>
                <td colSpan="4" className="metrics-table-empty-td">No subject data compiled for this month.</td>
              </tr>
            ) : (
              subjectsList.map((sub, index) => (
                <tr key={index}>
                  <td className="metrics-table-td">{sub.subject.replace(/_/g, ' ')}</td>
                  <td className="metrics-table-td">{sub.sessions} sessions</td>
                  <td className="metrics-table-td">{sub.avg_minutes} mins / session</td>
                  <td className="metrics-table-td">${sub.revenue}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}