// // src/App.jsx
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import Dashboard from './pages/Dashboard';
// import StudentDetails from './pages/StudentDetails';
// import Metrics from './pages/Metrics';
// import ProtectedRoute from './components/ProtectedRoute';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Public Auth Routes */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />

//         {/* Protected Dashboard Routes */}
//         <Route path="/" element={
//           <ProtectedRoute><Dashboard /></ProtectedRoute>
//         } />
//         <Route path="/students/:id" element={
//           <ProtectedRoute><StudentDetails /></ProtectedRoute>
//         } />
//         <Route path="/metrics" element={
//           <ProtectedRoute><Metrics /></ProtectedRoute>
//         } />

//         {/* Catch-all redirect */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StudentDetails from './pages/StudentDetails';
import Metrics from './pages/Metrics';
import ProtectedRoute from './components/ProtectedRoute'; // Ensure filename matches
import Navbar from './components/Navbar'; // Import your new shared ribbon

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes - No Navbar here */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes - Navbar is included inside ProtectedRoute */}
        <Route path="/" element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/students/:id" element={
          <ProtectedRoute>
            <Navbar />
            <StudentDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/metrics" element={
          <ProtectedRoute>
            <Navbar />
            <Metrics />
          </ProtectedRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;