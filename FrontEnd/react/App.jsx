import React, { useState } from 'react';
import LoginPage from './LoginPage';
import CreateTestPage from './CreateTestPage';
import LeaderboardPage from './LeaderboardPage';

function HostDashboard({ email, onCreateTest }) {
  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'linear-gradient(135deg,#ffe57f,#ff8a65)'}}>
      <div style={{background:'#fff8e1',padding:40,borderRadius:20,boxShadow:'0 10px 20px rgba(0,0,0,0.1)',textAlign:'center',maxWidth:600}}>
        <h1 style={{color:'#ff5722'}}>Welcome {email}</h1>
        <button onClick={onCreateTest} style={{background:'#ff7043',color:'white',border:'none',padding:'14px 28px',fontSize:'1rem',borderRadius:8,cursor:'pointer',marginTop:20}}>Create Your Test</button>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [page, setPage] = useState('dashboard');

  if (!loggedIn) {
    return <LoginPage onLogin={email => { setLoggedIn(true); setEmail(email); setPage('dashboard'); }} />;
  }
  if (page === 'dashboard') {
    return <HostDashboard email={email} onCreateTest={()=>setPage('createTest')} />;
  }
  if (page === 'createTest') {
    return <CreateTestPage onTestCreated={()=>setPage('leaderboard')} />;
  }
  if (page === 'leaderboard') {
    return <LeaderboardPage />;
  }
  return null;
}
