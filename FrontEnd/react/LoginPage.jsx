import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call backend API for login
    const res = await fetch('/api/QuizHost/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      onLogin(email);
    } else {
      alert('Login failed');
    }
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'linear-gradient(135deg,#ffe57f,#ff8a65)'}}>
      <form onSubmit={handleSubmit} style={{background:'#fff8e1',padding:40,borderRadius:20,boxShadow:'0 10px 20px rgba(0,0,0,0.1)',textAlign:'center',maxWidth:400}}>
        <h2 style={{color:'#ff5722'}}>Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%',padding:10,margin:'10px 0',borderRadius:8,border:'1px solid #ccc'}} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',padding:10,margin:'10px 0',borderRadius:8,border:'1px solid #ccc'}} />
        <button type="submit" style={{background:'#ff7043',color:'white',border:'none',padding:'12px 24px',borderRadius:8,cursor:'pointer',marginTop:10}}>Login</button>
      </form>
    </div>
  );
}
