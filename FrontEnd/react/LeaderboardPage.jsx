import React, { useState } from 'react';

export default function LeaderboardPage() {
  // Dummy leaderboard data for demonstration
  const leaderboard = [
    { name: 'Alice', score: 90, time: '5:12', difficulty: 'Hard' },
    { name: 'Bob', score: 90, time: '6:01', difficulty: 'Medium' },
    { name: 'Charlie', score: 85, time: '4:55', difficulty: 'Hard' },
    { name: 'David', score: 80, time: '7:10', difficulty: 'Easy' },
  ];

  // Sort by score, then by time, then by difficulty
  const sorted = leaderboard.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.time !== b.time) return a.time.localeCompare(b.time);
    if (a.difficulty !== b.difficulty) return b.difficulty.localeCompare(a.difficulty);
    return 0;
  });

  return (
    <div style={{maxWidth:600,margin:'40px auto',background:'#fff8e1',padding:40,borderRadius:20,boxShadow:'0 10px 20px rgba(0,0,0,0.1)'}}>
      <h2>Leaderboard</h2>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr style={{background:'#ff7043',color:'white'}}>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
            <th>Time</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry,i)=>(
            <tr key={i} style={{background:i%2?'#ffe57f':'#fff8e1'}}>
              <td>{i+1}</td>
              <td>{entry.name}</td>
              <td>{entry.score}</td>
              <td>{entry.time}</td>
              <td>{entry.difficulty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
