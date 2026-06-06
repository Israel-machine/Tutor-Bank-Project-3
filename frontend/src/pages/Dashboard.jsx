import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  
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

  const handlePhoneInputChange = (e) => {
    const maskedVal = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, contact_phone: maskedVal });
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
    <div className="page-wrapper">
      <header className="dashboard-header">
        <h1>TutorBank Students Dashboard</h1>
      </header>

      {error && <p className="error-message">{error}</p>}

      <div className="detail-container">
        
        <div className="sidebar-column">
          <div className="add-student-container">
            <h3>Add New Student</h3>
            <form onSubmit={handleCreateStudent}>
              
              <div className="form-group">
                <label>Student First Name</label>
                <input type="text" name="student_first_name" value={formData.student_first_name} onChange={handleInputChange} required className="form-input" />
              </div>

              <div className="form-group">
                <label>Student Last Name</label>
                <input type="text" name="student_last_name" value={formData.student_last_name} onChange={handleInputChange} required className="form-input" />
              </div>

              <div className="form-group">
                <label>School</label>
                <input type="text" name="school" value={formData.school} onChange={handleInputChange} className="form-input" />
              </div>

              {/* Strict Grade Dropdown Menu */}
              <div className="form-group">
                <label>School Grade</label>
                <select name="school_grade" value={formData.school_grade} onChange={handleInputChange} required className="form-select">
                  <option value="">Select Grade</option>
                  <option value="K">K</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num.toString()}>{num}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Billing Address</label>
                <input type="text" name="billing_address" value={formData.billing_address} onChange={handleInputChange} className="form-input" />
              </div>

              <div className="form-group">
                <label>Contact Name</label>
                <input type="text" name="contact_name" value={formData.contact_name} onChange={handleInputChange} required className="form-input" />
              </div>

              {/* Mask Validated Phone Form Input Field */}
              <div className="form-group">
                <label>Contact Phone</label>
                <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handlePhoneInputChange} maxLength="16" placeholder="(555) 555 - 5555" className="form-input" />
              </div>

              <div className="form-group">
                <label>Contact Email</label>
                <input type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} className="form-input" />
              </div>

              <button type="submit" className="btn btn-success auth-submit-btn-color">
                Add Student
              </button>
            </form>
          </div>
        </div>

        <div className="main-content-column">
          <h3>Your Caseload</h3>
          <div className="caseload-grid">
            {students.map((student) => (
              <div key={student.id} className="caseload-card card-flex-wrapper">
                <div>
                  <h4>{student.student_first_name} {student.student_last_name}</h4>
                  <p className="card-text-sm">Grade: {student.school_grade || 'N/A'}</p>
                  <p className="card-text-sm">School: {student.school || 'N/A'}</p>
                </div>
                <div className="card-actions-wrapper">
                  <Link to={`/students/${student.id}`} className="card-view-link">
                    View Sessions & Details
                  </Link>
                  <button onClick={() => handleDeleteStudent(student.id)} className="btn btn-danger btn-padding-sm">
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
