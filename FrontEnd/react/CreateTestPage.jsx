import React, { useState } from 'react';

export default function CreateTestPage({ onTestCreated }) {
  const [eventTitle, setEventTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [numQuestions, setNumQuestions] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState('');
  const [quizLink, setQuizLink] = useState('');

  // Question fields
  const [qText, setQText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(1);
  const [difficulty, setDifficulty] = useState('Easy');

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      text: qText,
      options,
      correct,
      score,
      difficulty
    }]);
    setQText('');
    setOptions(['', '', '', '']);
    setCorrect(0);
    setScore(1);
    setDifficulty('Easy');
    setCurrentQ(currentQ + 1);
  };

  const handleCreateQuiz = async () => {
    // Send quiz data to backend, get unique link
    const res = await fetch('/api/QuizHost/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventTitle,
        instructions,
        numQuestions,
        questions,
        feedbackForm
      })
    });
    const data = await res.json();
    setQuizLink(data.link || 'Error generating link');
    setShowFeedback(true);
  };

  if (showFeedback) {
    const handleFeedbackSubmit = async () => {
      await fetch('/api/QuizHost/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quizLink.split('/').pop(), feedback: feedbackForm })
      });
      onTestCreated();
    };
    return (
      <div style={{textAlign:'center',marginTop:'60px'}}>
        <h2>Feedback Form</h2>
        <textarea value={feedbackForm} onChange={e=>setFeedbackForm(e.target.value)} placeholder="Enter feedback questions for candidates..." style={{width:'80%',height:'100px',margin:'20px 0',borderRadius:8}} />
        <div>
          <h3>Your Quiz Link:</h3>
          <input type="text" value={quizLink} readOnly style={{width:'60%',padding:8,borderRadius:8}} />
          <button onClick={()=>navigator.clipboard.writeText(quizLink)} style={{marginLeft:10,padding:'8px 16px',borderRadius:8,background:'#ff7043',color:'white',border:'none'}}>Copy & Share</button>
        </div>
        <div style={{marginTop:30}}>
          <button onClick={handleFeedbackSubmit} style={{padding:'12px 24px',borderRadius:8,background:'#ff7043',color:'white',border:'none'}}>Submit Feedback & Go to Leaderboard</button>
        </div>
      </div>
    );
  }

  if (currentQ < numQuestions) {
    return (
      <div style={{maxWidth:600,margin:'40px auto',background:'#fff8e1',padding:40,borderRadius:20,boxShadow:'0 10px 20px rgba(0,0,0,0.1)'}}>
        <h2>Question {currentQ+1} of {numQuestions}</h2>
        <input type="text" value={qText} onChange={e=>setQText(e.target.value)} placeholder="Question text" style={{width:'100%',padding:10,margin:'10px 0',borderRadius:8}} />
        {options.map((opt,i)=>(
          <input key={i} type="text" value={opt} onChange={e=>{
            const newOpts = [...options]; newOpts[i]=e.target.value; setOptions(newOpts);
          }} placeholder={`Option ${i+1}`} style={{width:'100%',padding:10,margin:'5px 0',borderRadius:8}} />
        ))}
        <div style={{margin:'10px 0'}}>
          <label>Correct Option: </label>
          <select value={correct} onChange={e=>setCorrect(Number(e.target.value))} style={{borderRadius:8,padding:6}}>
            {[0,1,2,3].map(i=>(<option key={i} value={i}>{`Option ${i+1}`}</option>))}
          </select>
        </div>
        <div style={{margin:'10px 0'}}>
          <label>Score: </label>
          <input type="number" value={score} onChange={e=>setScore(Number(e.target.value))} min={1} max={100} style={{width:60,borderRadius:8}} />
        </div>
        <div style={{margin:'10px 0'}}>
          <label>Difficulty: </label>
          <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} style={{borderRadius:8,padding:6}}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
        <button onClick={handleAddQuestion} style={{background:'#ff7043',color:'white',border:'none',padding:'12px 24px',borderRadius:8,cursor:'pointer',marginTop:10}}>Add Question</button>
      </div>
    );
  }

  return (
    <div style={{maxWidth:600,margin:'40px auto',background:'#fff8e1',padding:40,borderRadius:20,boxShadow:'0 10px 20px rgba(0,0,0,0.1)'}}>
      <h2>Create Quiz Test</h2>
      <input type="text" value={eventTitle} onChange={e=>setEventTitle(e.target.value)} placeholder="Event Title" style={{width:'100%',padding:10,margin:'10px 0',borderRadius:8}} />
      <textarea value={instructions} onChange={e=>setInstructions(e.target.value)} placeholder="Instructions for test..." style={{width:'100%',height:'60px',margin:'10px 0',borderRadius:8}} />
      <div>
        <label>How many questions do you want to add?</label>
        <input type="number" value={numQuestions} onChange={e=>setNumQuestions(Number(e.target.value))} min={1} max={50} style={{width:60,borderRadius:8,marginLeft:10}} />
      </div>
      <button onClick={()=>setCurrentQ(0)} style={{background:'#ff7043',color:'white',border:'none',padding:'12px 24px',borderRadius:8,cursor:'pointer',marginTop:20}}>Start Adding Questions</button>
    </div>
  );
}
