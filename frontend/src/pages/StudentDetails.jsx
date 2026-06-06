import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentDetails() {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const { logout } = useAuth();
  
  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [error, setError] = useState('');

  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editSessionForm, setEditSessionForm] = useState({
    date: '',
    subject: 'Math',
    hourly_rate: '',
    duration_minutes: '',
    session_notes: ''
  });

  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: 'Math',
    hourly_rate: '',
    duration_minutes: '',
    session_notes: ''
  });
  const [studentForm, setStudentForm] = useState({});

  useEffect(() => {
    fetchStudentAndSessions();
  }, [id]);

  const fetchStudentAndSessions = async () => {
    try {
      setError(''); // Reset error state on new fetch attempt
      
      const studentRes = await fetch(`/api/students/${id}`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!studentRes.ok) {
        const errorData = await studentRes.json();
        setError(errorData.error || "Unauthorized access attempt.");
        setStudent(null); 
        return;
      }

      const currentStudent = await studentRes.json();
      setStudent(currentStudent);
      setStudentForm(currentStudent);

      const sessionsRes = await fetch(`/api/students/${id}/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!sessionsRes.ok) throw new Error("Failed to load session history.");
      
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStudentUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentForm)
      });
      if (!res.ok) throw new Error("Failed updating student details");
      setIsEditing(false);
      fetchStudentAndSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/students/${id}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sessionForm)
      });
      if (!res.ok) throw new Error("Failed saving session");
      
      setSessionForm({
        date: new Date().toISOString().split('T')[0],
        subject: 'Math', hourly_rate: '', duration_minutes: '', session_notes: ''
      });
      fetchStudentAndSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditingSession = (session) => {
    setEditingSessionId(session.id);
    setEditSessionForm({
      date: session.date,
      subject: session.subject,
      hourly_rate: session.hourly_rate,
      duration_minutes: session.duration_minutes,
      session_notes: session.session_notes || ''
    });
  };

  const handleSessionUpdateSubmit = async (e, sessionId) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editSessionForm)
      });
      if (!res.ok) throw new Error("Failed updating session details");
      setEditingSessionId(null);
      fetchStudentAndSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Delete this session record?")) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed deleting session");
      fetchStudentAndSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleNotes = (id) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateCurrentMonthRevenue = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return sessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getFullYear() === currentYear && sessionDate.getMonth() === currentMonth;
      })
      .reduce((total, session) => {
        const cost = (session.hourly_rate * session.duration_minutes) / 60;
        return total + cost;
      }, 0)
      .toFixed(2);
  };

  const currentMonthRevenue = calculateCurrentMonthRevenue();
  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#e74a3b' }}>⚠️ Security Alert</h2>
        <p style={{ fontSize: '18px', color: '#555' }}>{error}</p>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold', color: '#4e73df' }}>
          ← Return to Secure Dashboard
        </Link>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h3>Initializing secure record profile...</h3>
      </div>
    );
  }

  // Main Page Render
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
      
      <header style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Student Session Manager</h1>
      </header>

      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
        
        {/* Left Column: Student Profile Info */}
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
            {!isEditing ? (
              <div>
                <h3 style={{ marginTop: 0 }}>{student.student_first_name} {student.student_last_name}</h3>
                <p><strong>School:</strong> {student.school} (Grade {student.school_grade})</p>
                <p><strong>Billing Address:</strong> {student.billing_address}</p>
                <p><strong>Contact Name:</strong> {student.contact_name}</p>
                <p><strong>Phone:</strong> {student.contact_phone}</p>
                <p><strong>Email:</strong> {student.contact_email}</p>
                <button onClick={() => setIsEditing(true)} style={{ marginTop: '10px', padding: '6px 12px', cursor: 'pointer' }}>Edit Details</button>
              </div>
            ) : (
              <form onSubmit={handleStudentUpdate}>
                <h3>Edit Profile</h3>
                {Object.keys(studentForm).filter(k => k !== 'id').map(field => (
                  <div key={field} style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', textTransform: 'capitalize' }}>{field.replace(/_/g, ' ')}</label>
                    <input 
                      type="text" 
                      value={studentForm[field] || ''} 
                      onChange={e => setStudentForm({...studentForm, [field]: e.target.value})}
                      style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <button type="submit" style={{ marginRight: '10px', backgroundColor: '#4e73df', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '6px 12px', cursor: 'pointer' }}>Cancel</button>
              </form>
            )}
          </div>

          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Revenue for Current Month:</h4>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1cc88a' }}>
              ${currentMonthRevenue}
            </p>
          </div>
          
        </div>

        {/* Right Column: Logging and History */}
        <div style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0 }}>Log a New Session</h3>
          <form onSubmit={handleSessionSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '30px', alignItems: 'end', backgroundColor: '#fdfdfd', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
            <div>
              <label style={{ fontSize: '12px' }}>Session Date</label>
              <input type="date" value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} required style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px' }}>Subject</label>
              <select value={sessionForm.subject} onChange={e => setSessionForm({...sessionForm, subject: e.target.value})} style={{ width: '100%', padding: '6px' }}>
                <option value="English">English</option>
                <option value="Biological_Science">Biological Sciences</option>
                <option value="Physical_Science">Physical Sciences</option>
                <option value="Humanities">Humanities</option>
                <option value="Foreign Language">Foreign Language</option>
                <option value="Math">Math</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px' }}>Duration (Mins)</label>
              <input type="number" step="15" value={sessionForm.duration_minutes} onChange={e => setSessionForm({...sessionForm, duration_minutes: e.target.value})} required style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px' }}>Hourly Rate ($)</label>
              <input type="number" value={sessionForm.hourly_rate} onChange={e => setSessionForm({...sessionForm, hourly_rate: e.target.value})} required style={{ width: '100%', padding: '6px' }} />
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <label style={{ fontSize: '12px' }}>Session Notes</label>
              <input type="text" placeholder="e.g. Focused on trigonometry..." value={sessionForm.session_notes} onChange={e => setSessionForm({...sessionForm, session_notes: e.target.value})} style={{ width: '100%', padding: '6px' }} />
            </div>
            <button type="submit" style={{ padding: '7px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Session</button>
          </form>

          <h3>Logged History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.length === 0 ? <p style={{ color: '#888' }}>No sessions logged for this student yet.</p> : sessions.map(s => {
              const sessionCost = ((s.hourly_rate * s.duration_minutes) / 60).toFixed(2);
              const isCurrentSessionEditing = editingSessionId === s.id;

              return (
                <div key={s.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  {!isCurrentSessionEditing ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px' }}>
                        <span>{s.date} — {s.subject.replace(/_/g, ' ')}</span>
                        <span style={{ color: '#4e73df' }}>${sessionCost}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        {s.duration_minutes} minutes @ ${s.hourly_rate}/hr
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => toggleNotes(s.id)} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                            {expandedNotes[s.id] ? 'Hide Notes' : 'View Notes'}
                          </button>
                          <button onClick={() => startEditingSession(s)} style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#4e73df', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Edit
                          </button>
                        </div>
                        <button onClick={() => handleDeleteSession(s.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#e74a3b', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Delete Record</button>
                      </div>
                      {expandedNotes[s.id] && (
                        <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f1f3f9', borderRadius: '4px', fontSize: '14px', borderLeft: '4px solid #4e73df' }}>
                          {s.session_notes || "No context notes provided."}
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleSessionUpdateSubmit(e, s.id)} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', display: 'block' }}>Date</label>
                        <input type="date" value={editSessionForm.date} onChange={e => setEditSessionForm({...editSessionForm, date: e.target.value})} required style={{ width: '100%', padding: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', display: 'block' }}>Subject</label>
                        <select value={editSessionForm.subject} onChange={e => setEditSessionForm({...editSessionForm, subject: e.target.value})} style={{ width: '100%', padding: '4px' }}>
                          <option value="English">English</option>
                          <option value="Biological_Science">Biological Sciences</option>
                          <option value="Physical_Science">Physical Sciences</option>
                          <option value="Humanities">Humanities</option>
                          <option value="Foreign Language">Foreign Language</option>
                          <option value="Math">Math</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', display: 'block' }}>Mins</label>
                        <input type="number" step="15" value={editSessionForm.duration_minutes} onChange={e => setEditSessionForm({...editSessionForm, duration_minutes: e.target.value})} required style={{ width: '100%', padding: '4px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', display: 'block' }}>Rate ($)</label>
                        <input type="number" value={editSessionForm.hourly_rate} onChange={e => setEditSessionForm({...editSessionForm, hourly_rate: e.target.value})} required style={{ width: '100%', padding: '4px' }} />
                      </div>
                      <div style={{ gridColumn: 'span 3' }}>
                        <label style={{ fontSize: '11px', display: 'block' }}>Notes</label>
                        <input type="text" value={editSessionForm.session_notes} onChange={e => setEditSessionForm({...editSessionForm, session_notes: e.target.value})} style={{ width: '100%', padding: '5px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'end', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ padding: '5px 10px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                        <button type="button" onClick={() => setEditingSessionId(null)} style={{ padding: '5px 10px', backgroundColor: '#858796', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}