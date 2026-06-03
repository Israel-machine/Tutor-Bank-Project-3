import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Metrics() {
  const token = localStorage.getItem('token');
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/metrics/summary', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Could not parse operational analytical breakdowns.");
        return res.json();
      })
      .then(data => setMetrics(data))
      .catch(err => setError(err.message));
  }, []);

  if (!metrics) return <div style={{ padding: '20px' }}>Building statistical engine profiles...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>TutorBank Operations Dashboard</h1>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold', alignSelf: 'center' }}>← Return to Caseload</Link>
      </header>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Grid Summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Revenue Snapshots Card */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>💰 Revenue Report Snapshot</h3>
          <p style={{ fontSize: '18px' }}><strong>Total Account Revenue:</strong> ${metrics.total_revenue}</p>
          <p style={{ fontSize: '18px' }}><strong>Average Invoiced Per Session:</strong> ${metrics.avg_revenue_per_session}</p>
        </div>

        {/* Operational Durations Metrics Card */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>⏱️ Clocked Minutes Report</h3>
          <p style={{ fontSize: '18px' }}><strong>Total Logs Completed:</strong> {metrics.total_sessions} sessions</p>
          <p style={{ fontSize: '18px' }}><strong>Total Service Minutes Accumulated:</strong> {metrics.total_minutes} mins</p>
          <p style={{ fontSize: '18px' }}><strong>Average Session Length:</strong> {metrics.avg_duration} mins</p>
        </div>

      </div>

      {/* Breakdown Listings */}
      <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>📚 Subject Report Invoicing Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Subject Tracking Domain</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Total Session Counts</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Clocked Hours / Minutes</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Accumulated Gross Revenue</th>
            </tr>
          </thead>
          <tbody>
            {metrics.subjects.map((sub, index) => (
              <tr key={index}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{sub.subject}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{sub.sessions} sessions</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{sub.minutes} mins</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>${sub.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}