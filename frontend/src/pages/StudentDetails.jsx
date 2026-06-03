import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function StudentDetails() {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  
  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({}); // Tracking expanded state per session ID
  const [error, setError] = useState('');

  // Form States
  const [studentForm, setStudentForm] = useState({});
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: 'Math',
    hourly_rate: '',
    duration_minutes: '',
    session_notes: ''
  });

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

  if (!student) return <div style={{ padding: '20px' }}>Loading record profile information...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold' }}>← Back to Caseload Dashboard</Link>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
        {/* Left Hand Card: Student Profile Information View / Edit */}
        <div style={{ width: '350px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
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
                <option value="Math">Math</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
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
            {sessions.map(s => (
              <div key={s.id} style={{ border: '1px solid #eee', padding: '12px', borderRadius: '4px', backgroundColor: '#fdfdfd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>{s.date} - {s.subject}</span>
                  <span>{s.duration_minutes} mins @ ${s.hourly_rate}/hr</span>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <button onClick={() => toggleNotes(s.id)} style={{ padding: '2px 6px', marginRight: '10px', fontSize: '12px' }}>
                    {expandedNotes[s.id] ? 'Hide Notes' : 'Expand Session Notes'}
                  </button>
                  <button onClick={() => handleDeleteSession(s.id)} style={{ float: 'right', backgroundColor: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '12px' }}>Delete Record</button>
                </div>
                {expandedNotes[s.id] && (
                  <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f1f1f1', borderRadius: '4px', fontSize: '14px' }}>
                    {s.session_notes || "No context notes provided during session completion logging."}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}