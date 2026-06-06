import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Universal regex mask helper to enforce exactly (###) ### - #### format
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
        
        {/* Left Side Panel: Pure White Creation Container */}
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

              <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '10px' }}>
                Add Student
              </button>
            </form>
          </div>
        </div>

        {/* Right Content Stream: Pastel Lemon Yellow Student Cards */}
        <div className="main-content-column">
          <h3>Your Caseload</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {students.map((student) => (
              <div key={student.id} className="caseload-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4>{student.student_first_name} {student.student_last_name}</h4>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>Grade: {student.school_grade || 'N/A'}</p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>School: {student.school || 'N/A'}</p>
                </div>
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={`/students/${student.id}`} style={{ textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                    View Sessions & Details
                  </Link>
                  <button onClick={() => handleDeleteStudent(student.id)} className="btn btn-danger" style={{ padding: '4px 8px' }}>
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


// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { Link } from 'react-router-dom';

// export default function Dashboard() {
//   const { logout } = useAuth();
//   const [students, setStudents] = useState([]);
//   const [error, setError] = useState('');
  
//   // Form States for all 8 student fields
//   const [formData, setFormData] = useState({
//     student_first_name: '',
//     student_last_name: '',
//     school: '',
//     school_grade: '',
//     billing_address: '',
//     contact_name: '',
//     contact_phone: '',
//     contact_email: ''
//   });

//   const token = localStorage.getItem('token');

//   const fetchStudents = async () => {
//   try {
//     // Ensure there is NO slash at the end of 'students'
//     const res = await fetch('/api/students', {
//       headers: { 'Authorization': `Bearer ${token}` }
//     });
    
//     if (!res.ok) throw new Error('Failed to fetch students');
    
//     const data = await res.json();
//     setStudents(data);
//   } catch (err) {
//     setError(err.message);
//   }
// };

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleCreateStudent = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch('/api/students', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(formData)
//       });
//       if (!res.ok) throw new Error('Failed to create student');
      
//       setFormData({
//         student_first_name: '', student_last_name: '', school: '',
//         school_grade: '', billing_address: '', contact_name: '',
//         contact_phone: '', contact_email: ''
//       });
//       fetchStudents();
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleDeleteStudent = async (id) => {
//     if (!window.confirm("Delete student and all associated sessions?")) return;
//     try {
//       const res = await fetch(`/api/students/${id}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (!res.ok) throw new Error('Failed to delete student');
//       fetchStudents();
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
//       <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
//         <h1>TutorBank Students Dashboard</h1>
//       </header>

//       {error && <p style={{ color: 'red' }}>{error}</p>}

//       <div style={{ display: 'flex', marginTop: '20px', gap: '40px' }}>
//         <div style={{ width: '300px', padding: '15px', border: '1px solid #ddd', borderRadius: '6px' }}>
//           <h3>Add New Student</h3>
//           <form onSubmit={handleCreateStudent}>
//             {Object.keys(formData).map((field) => (
//               <div key={field} style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '12px', textTransform: 'capitalize' }}>
//                   {field.replace(/_/g, ' ')}:
//                 </label>
//                 <input
//                   type="text"
//                   name={field}
//                   value={formData[field]}
//                   onChange={handleInputChange}
//                   required={['student_first_name', 'student_last_name', 'contact_name'].includes(field)}
//                   style={{ width: '100%', padding: '5px', boxSizing: 'border-box' }}
//                 />
//               </div>
//             ))}
//             <button type="submit" style={{ width: '100%', padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
//               Add Student
//             </button>
//           </form>
//         </div>

//         <div style={{ flex: 1 }}>
//           <h3>Your Caseload</h3>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
//             {students.map((student) => (
//               <div key={student.id} style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
//                 <div>
//                   <h4>{student.student_first_name} {student.student_last_name}</h4>
//                   <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>Grade: {student.school_grade || 'N/A'}</p>
//                   <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>School: {student.school || 'N/A'}</p>
//                 </div>
//                 <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
//                   <Link to={`/students/${student.id}`} style={{ textDecoration: 'none', color: '#007bff', fontSize: '14px', alignSelf: 'center' }}>
//                     View Sessions & Details
//                   </Link>
//                   <button onClick={() => handleDeleteStudent(student.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }