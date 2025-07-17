import React from 'react';

function Home() {
  const handleStart = () => {
    window.location.href = 'admin-login.html';
  };

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #ffe57f, #ff8a65)'}}>
      <div style={{background: '#fff8e1', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '600px'}}>
        <h1 style={{fontFamily: 'Fredoka, sans-serif', color: '#ff5722'}}>Welcome to Quiz App</h1>
        <button onClick={handleStart} style={{backgroundColor: '#ff7043', color: 'white', border: 'none', padding: '14px 28px', fontSize: '1rem', borderRadius: '8px', cursor: 'pointer', marginTop: '20px', transition: 'background 0.3s ease'}}>Start Generating Quiz</button>
      </div>
    </div>
  );
}

export default Home;
