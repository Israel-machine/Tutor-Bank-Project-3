import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Metrics() {
  const token = localStorage.getItem('token');
  const { logout } = useAuth();
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

  if (!metrics) return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Building statistical engine profiles...</div>;

  // Safe assignments to guard against empty responses
  const subjectsList = metrics.subjects || [];
  const revenueRankList = metrics.revenue_ranking || [];
  const minutesRankList = metrics.minutes_ranking || [];

  // Safe Pie Chart Computation
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
    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>TutorBank Operations Dashboard (Current Month)</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold' }}>← Return to Caseload</Link>
          <button onClick={logout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* --- ROW 1: TOP SUMMARY SNAPSHOTS AND RANKINGS GRID --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        
        {/* Revenue Snapshots Card with Top 10 Rank */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>💰 Revenue Report Snapshot</h3>
          <p style={{ fontSize: '16px' }}><strong>Total Account Revenue:</strong> ${metrics.total_revenue || '0.00'}</p>
          <p style={{ fontSize: '16px' }}><strong>Average Invoiced Per Session:</strong> ${metrics.avg_revenue_per_session || '0.00'}</p>
          
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ddd' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>🏆 Top 10 Revenue Rankings</h4>
            {revenueRankList.length === 0 ? <p style={{ fontSize: '13px', color: '#777' }}>No records found.</p> : 
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '22px' }}>
                {revenueRankList.map((student, idx) => (
                  <li key={idx}><strong>{student.name}</strong> : ${student.revenue}</li>
                ))}
              </ol>
            }
          </div>
        </div>

        {/* Operational Durations Metrics Card with Top 10 Rank */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>⏱️ Clocked Minutes Report</h3>
          <p style={{ fontSize: '16px' }}><strong>Total Logs Completed:</strong> {metrics.total_sessions || 0} sessions</p>
          <p style={{ fontSize: '16px' }}><strong>Total Service Minutes Accumulated:</strong> {metrics.total_minutes || 0} mins</p>
          <p style={{ fontSize: '16px' }}><strong>Average Session Length:</strong> {metrics.avg_duration || '0.00'} mins</p>

          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ddd' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>⚡ Top 10 Time Allocation Rankings</h4>
            {minutesRankList.length === 0 ? <p style={{ fontSize: '13px', color: '#777' }}>No records found.</p> : 
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '22px' }}>
                {minutesRankList.map((student, idx) => (
                  <li key={idx}><strong>{student.name}</strong> : {student.minutes} mins</li>
                ))}
              </ol>
            }
          </div>
        </div>

      </div>

      {/* --- ROW 2: SUBJECT DISTRIBUTION PIE CHART ROW (MOVED TO MIDDLE) --- */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginBottom: '30px', backgroundColor: '#f8f9fa' }}>
        <h3 style={{ marginTop: 0 }}>📊 Subject Report Invoice: Monthly Session Log Allocations</h3>
        {subjectsList.length === 0 || totalSessionsCount === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No sessions logged during the active monthly tracking period.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginTop: '15px' }}>
            <div style={pieChartStyle} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {subjectsList.map((sub, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: chartColors[i % chartColors.length] }} />
                  <strong>{sub.subject.replace(/_/g, ' ')}:</strong> {sub.sessions} sessions ({((sub.sessions / totalSessionsCount) * 100).toFixed(1)}%)
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ROW 3: CURRENT MONTH BREAKDOWN SUMMARY LISTING TABLE --- */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>
        <h3>📚 Current Month Breakdown Summary Listing</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Subject Tracking Domain</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Total Session Counts</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Average Minutes Logged / Session</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Accumulated Gross Revenue</th>
            </tr>
          </thead>
          <tbody>
            {subjectsList.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#777' }}>No subject data compiled for this month.</td>
              </tr>
            ) : (
              subjectsList.map((sub, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{sub.subject.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{sub.sessions} sessions</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{sub.avg_minutes} mins / session</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>${sub.revenue}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}