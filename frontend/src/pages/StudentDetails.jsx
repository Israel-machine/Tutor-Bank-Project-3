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
  const [expandedNotes, setExpandedNotes] = useState({}); // Tracking expanded state per session ID
  const [error, setError] = useState('');

  // NEW STATE: Tracks which session ID is currently being edited, and its form data
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editSessionForm, setEditSessionForm] = useState({
    date: '',
    subject: 'Math',
    hourly_rate: '',
    duration_minutes: '',
    session_notes: ''
  });

  // Form States for creating a session
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
      // Fetch profile
      const studentRes = await fetch(`/api/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allStudents = await studentRes.json();
      const currentStudent = allStudents.find(s => s.id === parseInt(id));
      if (!currentStudent) throw new Error("Student details unavailable");
      
      setStudent(currentStudent);
      setStudentForm(currentStudent);

      // Fetch sessions
      const sessionsRes = await fetch(`/api/students/${id}/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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

  // NEW METHOD: Begins the editing lifecycle for a specific session card
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

  // NEW METHOD: Submits updated session modifications to the database engine
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

  if (!student) return <div style={{ padding: '20px' }}>Loading record profile information...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold' }}>← Back to Caseload Dashboard</Link>
        <div>
          <Link to="/metrics" style={{ marginRight: '15px', textDecoration: 'none', fontWeight: 'bold', color: '#007bff' }}>
            View Metrics
          </Link>
          <button onClick={logout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
        
        {/* Left Hand Container Column */}
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            {!isEditing ? (
              <div>
                <h3>{student.student_first_name} {student.student_last_name}</h3>
                <p><strong>School:</strong> {student.school} (Grade {student.school_grade})</p>
                <p><strong>Billing Address:</strong> {student.billing_address}</p>
                <p><strong>Contact Name:</strong> {student.contact_name}</p>
                <p><strong>Phone:</strong> {student.contact_phone}</p>
                <p><strong>Email:</strong> {student.contact_email}</p>
                <button onClick={() => setIsEditing(true)} style={{ marginTop: '10px', padding: '6px 12px' }}>Edit Details</button>
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
                      style={{ width: '100%', padding: '4px' }}
                    />
                  </div>
                ))}
                <button type="submit" style={{ marginRight: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 12px' }}>Save</button>
                <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '6px 12px' }}>Cancel</button>
              </form>
            )}
          </div>

          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Revenue for Current Month:</h4>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              ${currentMonthRevenue}
            </p>
          </div>
          
        </div>

        {/* Right Hand Content: Form and Action logs */}
        <div style={{ flex: 1 }}>
          <h3>Log a New Session</h3>
          <form onSubmit={handleSessionSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '30px', alignItems: 'end' }}>
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
                <option value="other">Other - Please add description in notes</option>
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
              <input type="text" value={sessionForm.session_notes} onChange={e => setSessionForm({...sessionForm, session_notes: e.target.value})} style={{ width: '100%', padding: '6px' }} />
            </div>
            <button type="submit" style={{ padding: '7px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Submit Session</button>
          </form>

          <h3>Logged History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sessions.map(s => {
              const sessionCost = ((s.hourly_rate * s.duration_minutes) / 60).toFixed(2);
              const isCurrentSessionEditing = editingSessionId === s.id;

              return (
                <div key={s.id} style={{ border: '1px solid #eee', padding: '12px', borderRadius: '4px', backgroundColor: '#fdfdfd' }}>
                  {!isCurrentSessionEditing ? (
                    /* NORMAL VIEW MODE */
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>{s.date} - {s.subject}</span>
                        <span>{s.duration_minutes} mins @ ${s.hourly_rate}/hr (Session Total: ${sessionCost})</span>
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <button onClick={() => toggleNotes(s.id)} style={{ padding: '2px 6px', marginRight: '10px', fontSize: '12px' }}>
                            {expandedNotes[s.id] ? 'Hide Notes' : 'Expand Session Notes'}
                          </button>
                          {/* NEW ACTION TRIGGER BUTTON */}
                          <button onClick={() => startEditingSession(s)} style={{ padding: '2px 6px', fontSize: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                            Edit Record
                          </button>
                        </div>
                        <button onClick={() => handleDeleteSession(s.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '12px' }}>Delete Record</button>
                      </div>
                      {expandedNotes[s.id] && (
                        <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f1f1f1', borderRadius: '4px', fontSize: '14px' }}>
                          {s.session_notes || "No context notes provided during session completion logging."}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* NEW MODIFICATION: INLINE CARD EDIT MODE FORM */
                    <form onSubmit={(e) => handleSessionUpdateSubmit(e, s.id)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', display: 'block' }}>Date</label>
                        <input type="date" value={editSessionForm.date} onChange={e => setEditSessionForm({...editSessionForm, date: e.target.value})} required style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', display: 'block' }}>Subject</label>
                        <select value={editSessionForm.subject} onChange={e => setEditSessionForm({...editSessionForm, subject: e.target.value})} style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}>
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
                        <input type="number" step="15" value={editSessionForm.duration_minutes} onChange={e => setEditSessionForm({...editSessionForm, duration_minutes: e.target.value})} required style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', display: 'block' }}>Rate ($)</label>
                        <input type="number" value={editSessionForm.hourly_rate} onChange={e => setEditSessionForm({...editSessionForm, hourly_rate: e.target.value})} required style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ gridColumn: 'span 3' }}>
                        <label style={{ fontSize: '11px', display: 'block' }}>Notes</label>
                        <input type="text" value={editSessionForm.session_notes} onChange={e => setEditSessionForm({...editSessionForm, session_notes: e.target.value})} style={{ width: '100%', padding: '5px', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'end', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                        <button type="button" onClick={() => setEditingSessionId(null)} style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
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