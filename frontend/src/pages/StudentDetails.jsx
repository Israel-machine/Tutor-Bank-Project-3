import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const formatPhoneNumber = (value) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)} - ${phoneNumber.slice(6, 10)}`;
};

export default function StudentDetails() {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  
  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [error, setError] = useState('');

  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editSessionForm, setEditSessionForm] = useState({
    date: '', subject: 'Math', hourly_rate: '', duration_minutes: '', session_notes: ''
  });

  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: 'Math', hourly_rate: '', duration_minutes: '', session_notes: ''
  });
  const [studentForm, setStudentForm] = useState({});

  useEffect(() => {
    fetchStudentAndSessions();
  }, [id]);

  const fetchStudentAndSessions = async () => {
    try {
      setError('');
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
        if (!session.date) return false;
        const dateParts = session.date.split('-'); 
        const sessionYear = parseInt(dateParts[0], 10);
        const sessionMonth = parseInt(dateParts[1], 10) - 1; 
        return sessionYear === currentYear && sessionMonth === currentMonth;
      })
      .reduce((total, session) => {
        const cost = (parseFloat(session.hourly_rate) * parseInt(session.duration_minutes, 10)) / 60;
        return total + cost;
      }, 0)
      .toFixed(2);
  };
    
  const currentMonthRevenue = calculateCurrentMonthRevenue();

  if (error) {
    return (
      <div className="security-alert-fallback">
        <h2>⚠️ Security Alert</h2>
        <p>{error}</p>
        <Link to="/">← Return to Secure Dashboard</Link>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="loading-fallback">
        <h3>Initializing secure record profile...</h3>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <header className="dashboard-header">
        <h1 className="student-details-header-title">Student Session Manager</h1>
      </header>

      <div className="detail-container">
        
        {/* Left Column: White Profile & Revenue Metadata */}
        <div className="sidebar-column">
          <div className="info-card">
            {!isEditing ? (
              <div>
                <h3 className="student-profile-title">{student.student_first_name} {student.student_last_name}</h3>
                <p><strong>School:</strong> {student.school} (Grade {student.school_grade})</p>
                <p><strong>Billing Address:</strong> {student.billing_address}</p>
                <p><strong>Contact Name:</strong> {student.contact_name}</p>
                <p><strong>Phone:</strong> {student.contact_phone}</p>
                <p><strong>Email:</strong> {student.contact_email}</p>
                <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-margin-right">Edit Details</button>
              </div>
            ) : (
              <form onSubmit={handleStudentUpdate}>
                <h3>Edit Profile</h3>
                <div className="form-group"><label>First Name</label><input type="text" className="form-input" value={studentForm.student_first_name || ''} onChange={e => setStudentForm({...studentForm, student_first_name: e.target.value})} /></div>
                <div className="form-group"><label>Last Name</label><input type="text" className="form-input" value={studentForm.student_last_name || ''} onChange={e => setStudentForm({...studentForm, student_last_name: e.target.value})} /></div>
                <div className="form-group"><label>School</label><input type="text" className="form-input" value={studentForm.school || ''} onChange={e => setStudentForm({...studentForm, school: e.target.value})} /></div>
                
                <div className="form-group">
                  <label>School Grade</label>
                  <select className="form-select" value={studentForm.school_grade || ''} onChange={e => setStudentForm({...studentForm, school_grade: e.target.value})} required>
                    <option value="K">K</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num.toString()}>{num}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group"><label>Billing Address</label><input type="text" className="form-input" value={studentForm.billing_address || ''} onChange={e => setStudentForm({...studentForm, billing_address: e.target.value})} /></div>
                <div className="form-group"><label>Contact Name</label><input type="text" className="form-input" value={studentForm.contact_name || ''} onChange={e => setStudentForm({...studentForm, contact_name: e.target.value})} /></div>
                <div className="form-group"><label>Contact Phone</label><input type="text" className="form-input" maxLength="16" value={studentForm.contact_phone || ''} onChange={e => setStudentForm({...studentForm, contact_phone: formatPhoneNumber(e.target.value)})} /></div>
                <div className="form-group"><label>Contact Email</label><input type="email" className="form-input" value={studentForm.contact_email || ''} onChange={e => setStudentForm({...studentForm, contact_email: e.target.value})} /></div>

                <div className="student-actions-row">
                  <button type="submit" className="btn btn-primary btn-margin-right">Save</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          <div className="info-card info-card-highlight">
            <h4 className="student-revenue-title">Revenue for Current Month:</h4>
            <p className="student-revenue-value">${currentMonthRevenue}</p>
          </div>
        </div>

        {/* Right Column: Logging (White Form Structure) & History (Yellow Cards) */}
        <div className="main-content-column">
          <h3 className="student-session-form-heading">Log a New Session</h3>
          <form onSubmit={handleSessionSubmit} className="form-grid student-form-grid-custom">
            <div>
              <label className="label-text-xs">Session Date</label>
              <input type="date" value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} required className="form-input" />
            </div>
            <div>
              <label className="label-text-xs">Subject</label>
              <select value={sessionForm.subject} onChange={e => setSessionForm({...sessionForm, subject: e.target.value})} className="form-select">
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
              <label className="label-text-xs">Duration (Mins)</label>
              <input type="number" step="15" value={sessionForm.duration_minutes} onChange={e => setSessionForm({...sessionForm, duration_minutes: e.target.value})} required className="form-input" />
            </div>
            <div>
              <label className="label-text-xs">Hourly Rate ($)</label>
              <input type="number" value={sessionForm.hourly_rate} onChange={e => setSessionForm({...sessionForm, hourly_rate: e.target.value})} required className="form-input" />
            </div>
            <div className="grid-span-3">
              <label className="label-text-xs">Session Notes</label>
              <input type="text" placeholder="e.g. Focused on trigonometry..." value={sessionForm.session_notes} onChange={e => setSessionForm({...sessionForm, session_notes: e.target.value})} className="form-input" />
            </div>
            <button type="submit" className="btn btn-success btn-padding-md">Submit Session</button>
          </form>

          <h3>Logged History</h3>
          <div className="history-list-wrapper">
            {sessions.length === 0 ? <p className="history-empty-text">No sessions logged for this student yet.</p> : sessions.map(s => {
              const sessionCost = ((s.hourly_rate * s.duration_minutes) / 60).toFixed(2);
              const isCurrentSessionEditing = editingSessionId === s.id;

              return (
                <div key={s.id} className="session-history-card">
                  {!isCurrentSessionEditing ? (
                    <div>
                      <div className="history-card-header">
                        <span>{s.date} — {s.subject.replace(/_/g, ' ')}</span>
                        <span className="history-card-cost">${sessionCost}</span>
                      </div>
                      <div className="history-card-meta">
                        {s.duration_minutes} minutes @ ${s.hourly_rate}/hr
                      </div>
                      <div className="history-card-actions">
                        <div className="history-actions-left">
                          <button onClick={() => toggleNotes(s.id)} className="btn btn-secondary btn-history-view-notes">
                            {expandedNotes[s.id] ? 'Hide Notes' : 'View Notes'}
                          </button>
                          <button onClick={() => startEditingSession(s)} className="btn btn-primary btn-history-edit">
                            Edit
                          </button>
                        </div>
                        <button onClick={() => handleDeleteSession(s.id)} className="btn btn-danger btn-history-delete">Delete Record</button>
                      </div>
                      {expandedNotes[s.id] && (
                        <div className="history-notes-dropdown">
                          {s.session_notes || "No context notes provided."}
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleSessionUpdateSubmit(e, s.id)} className="history-edit-form-grid">
                      <div><label className="label-text-xxs">Date</label><input type="date" value={editSessionForm.date} onChange={e => setEditSessionForm({...editSessionForm, date: e.target.value})} required className="form-input" /></div>
                      <div>
                        <label className="label-text-xxs">Subject</label>
                        <select value={editSessionForm.subject} onChange={e => setEditSessionForm({...editSessionForm, subject: e.target.value})} className="form-select">
                          <option value="English">English</option>
                          <option value="Biological_Science">Biological Sciences</option>
                          <option value="Physical_Science">Physical Sciences</option>
                          <option value="Humanities">Humanities</option>
                          <option value="Foreign Language">Foreign Language</option>
                          <option value="Math">Math</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div><label className="label-text-xxs">Mins</label><input type="number" step="15" value={editSessionForm.duration_minutes} onChange={e => setEditSessionForm({...editSessionForm, duration_minutes: e.target.value})} required className="form-input" /></div>
                      <div><label className="label-text-xxs">Rate ($)</label><input type="number" value={editSessionForm.hourly_rate} onChange={e => setEditSessionForm({...editSessionForm, hourly_rate: e.target.value})} required className="form-input" /></div>
                      <div className="grid-span-3">
                        <label className="label-text-xxs">Notes</label>
                        <input type="text" value={editSessionForm.session_notes} onChange={e => setEditSessionForm({...editSessionForm, session_notes: e.target.value})} className="form-input" />
                      </div>
                      <div className="history-edit-actions-container">
                        <button type="submit" className="btn btn-success btn-history-save-cancel">Save</button>
                        <button type="button" className="btn btn-secondary btn-history-save-cancel" onClick={() => setEditingSessionId(null)}>Cancel</button>
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
