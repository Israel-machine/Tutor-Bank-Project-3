import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  
  // Form States for all 8 student fields
  const [formData, setFormData] = useState({
    student_first_name: '',
    student_last_name: '',
    school: '',
    school_grade: '',
    billing_address: '',
    contact_name: '',
    contact_phone: '',
    contact_email: ''
  });

  const token = localStorage.getItem('token');

  const fetchStudents = async () => {
  try {
    // Ensure there is NO slash at the end of 'students'
    const res = await fetch('/api/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Failed to fetch students');
    
    const data = await res.json();
    setStudents(data);
  } catch (err) {
    setError(err.message);
  }
};

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create student');
      
      setFormData({
        student_first_name: '', student_last_name: '', school: '',
        school_grade: '', billing_address: '', contact_name: '',
        contact_phone: '', contact_email: ''
      });
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Delete student and all associated sessions?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete student');
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h1>TutorBank Students Dashboard</h1>
      </header>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', marginTop: '20px', gap: '40px' }}>
        <div style={{ width: '300px', padding: '15px', border: '1px solid #ddd', borderRadius: '6px' }}>
          <h3>Add New Student</h3>
          <form onSubmit={handleCreateStudent}>
            {Object.keys(formData).map((field) => (
              <div key={field} style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                  {field.replace(/_/g, ' ')}:
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  required={['student_first_name', 'student_last_name', 'contact_name'].includes(field)}
                  style={{ width: '100%', padding: '5px', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <button type="submit" style={{ width: '100%', padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
              Add Student
            </button>
          </form>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Your Caseload</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {students.map((student) => (
              <div key={student.id} style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4>{student.student_first_name} {student.student_last_name}</h4>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>Grade: {student.school_grade || 'N/A'}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>School: {student.school || 'N/A'}</p>
                </div>
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                  <Link to={`/students/${student.id}`} style={{ textDecoration: 'none', color: '#007bff', fontSize: '14px', alignSelf: 'center' }}>
                    View Sessions & Details
                  </Link>
                  <button onClick={() => handleDeleteStudent(student.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}