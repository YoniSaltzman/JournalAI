import React from 'react';
import Saved from './pages/Saved';
import Settings from './pages/Settings';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import JournalForm from './pages/Summarize';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useEffect } from 'react';
import isTokenExpired from './utils/authUtils';



function App({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        navigate('/login', { state: {message: 'session-expired '} });
      }
    }, []);

  return (
    <div className="App">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route 
          element={
            <ProtectedRoute user={user}>
              <Layout />
            </ProtectedRoute>}>
          {/* replace prevents the redirect from being added to browser history (cleaner UX) */}
          <Route path='/' element={<Navigate to='/Summarize' replace />}/>
          <Route path='/Summarize' element={<JournalForm />}/>
          <Route path='/Saved' element={<Saved />} />
          <Route path='/Settings' element={<Settings />}/>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
