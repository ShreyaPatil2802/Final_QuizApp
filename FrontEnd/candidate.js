// Candidate Quiz Flow
let quizId = '';
let quizData = null;
let candidate = { email: '', fullName: '' };
let currentQ = 0;
let answers = [];
let visited = [];
let markedForReview = [];
let startTime = null;
let duration = 0;
let feedbackForm = '';

// Log quiz activity to backend
function logQuizActivity({ quizId, userEmail, userName, actionType, details }) {
    fetch('/api/ActivityLog/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quizId,
            userEmail,
            userName,
            actionType,
            details: JSON.stringify(details)
        })
    });
}

// Get quizId from query string
function getQuizIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('quizId');
    // Try to get quizId from hash if not found in search
    if (!id && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
        id = hashParams.get('quizId');
    }
    // Try to get quizId from referrer if still not found
    if (!id && document.referrer) {
        const refParams = new URLSearchParams(document.referrer.split('?')[1] || '');
        id = refParams.get('quizId');
    }
    // Try to get quizId from localStorage if still not found
    if (!id && localStorage.getItem('quizId')) {
        id = localStorage.getItem('quizId');
    }
    return id;
}
quizId = getQuizIdFromUrl();

if (!quizId) {
    document.getElementById('loginContainer').innerHTML = `<div class='heading' style='color:red;'>Invalid or missing quiz link.<br>Please use the link provided by your host.</div>`;
    document.getElementById('candidateLoginForm').style.display = 'none';
} else {
    // Save quizId in localStorage for future reloads
    localStorage.setItem('quizId', quizId);
}

// Fetch quiz event details
fetch(`/api/QuizHost/event/${quizId}`)
    .then(res => {
        if (!res.ok) throw new Error('Quiz not found or not available');
        return res.json();
    })
    .then(data => {
        // Defensive: support both camelCase and PascalCase keys from backend
        if (data.isClosed || data.IsClosed) {
            document.getElementById('loginContainer').innerHTML = `<div class='heading' style='color:red;'>This quiz session has been closed by the host.</div>`;
            document.getElementById('candidateLoginForm').style.display = 'none';
            return;
        }
        quizData = {
            eventTitle: data.eventTitle || data.title || '',
            instructions: data.instructions || '',
            duration: data.duration || data.Duration || 10,
            numQuestions: data.numQuestions || data.NumQuestions || (data.questions ? data.questions.length : 0),
            feedbackForm: data.feedbackForm || '',
            questions: (data.questions || []).map(q => ({
                text: q.text || q.Text || '',
                options: (q.options || q.Options || []).map(o => o.OptionText || o.text || o.Text || o),
                correctOption: q.correctOption || q.CorrectOption || '',
                score: q.score || q.Score || 1,
                difficulty: q.difficulty || q.Difficulty || 'Easy'
            }))
        };
        document.getElementById('eventHeading').innerText = quizData.eventTitle || 'Quiz Event';
        duration = quizData.duration;
        // Check if quiz is open
        const now = new Date();
        if (quizData.startTime && quizData.endTime) {
            const start = new Date(quizData.startTime);
            const end = new Date(quizData.endTime);
            if (now < start || now > end) {
                document.getElementById('loginContainer').innerHTML = `<div class='heading'>Quiz is not open at this time.<br>Allowed: ${start.toLocaleString()} - ${end.toLocaleString()}</div>`;
            }
        }
    })
    .catch(err => {
        document.getElementById('loginContainer').innerHTML = `<div class='heading' style='color:red;'>${err.message}</div>`;
    });

// Fetch quiz event details with submission check
function fetchQuizEventWithSubmissionCheck(quizId, email) {
    return fetch(`/api/QuizHost/event/${quizId}?email=${encodeURIComponent(email)}`)
        .then(res => res.json());
}

// Candidate login
// Candidate login page UI enhancement
window.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('loginContainer');
    if (loginContainer) {
        loginContainer.innerHTML = `
            <form id="candidateLoginForm" class="login-form-full">
                <div class="login-heading" id="eventHeading">Quiz Event</div>
                <div class="input-group-full">
                    <label for="email">Email ID</label>
                    <input type="email" id="email" required placeholder="Enter your email" />
                </div>
                <div class="input-group-full">
                    <label for="fullName">Full Name</label>
                    <input type="text" id="fullName" required placeholder="Enter your full name" />
                </div>
                <div class="error" id="loginError"></div>
                <button class="btn login-btn-full" type="submit">Login & Start</button>
            </form>
            <style>
            html, body { height: 100%; margin: 0; padding: 0; }
            #loginContainer { min-height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; background: #f5f7fa; }
            .login-form-full {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 100vw;
                min-height: 100vh;
                background: none;
                padding: 0;
                margin: 0;
            }
            .login-heading {
                font-size: 2rem;
                color: #1976d2;
                font-weight: bold;
                margin-bottom: 32px;
                text-align: center;
                width: 100%;
            }
            .input-group-full {
                width: 100%;
                max-width: 400px;
                display: flex;
                flex-direction: column;
                margin-bottom: 18px;
            }
            .input-group-full label {
                color: #1976d2;
                font-weight: 500;
                margin-bottom: 6px;
                font-size: 1.08rem;
            }
            .input-group-full input {
                border: 1.5px solid #b0bec5;
                background: #fff;
                color: #222;
                border-radius: 10px;
                padding: 14px 16px;
                font-size: 1.08rem;
                margin-bottom: 8px;
                transition: border 0.2s, box-shadow 0.2s;
                box-shadow: 0 1px 4px rgba(25,118,210,0.04);
            }
            .input-group-full input:focus {
                border: 1.5px solid #1976d2;
                outline: none;
                box-shadow: 0 0 0 2px #90caf9aa;
            }
            .login-btn-full {
                background: linear-gradient(90deg, #1976d2 60%, #64b5f6 100%) !important;
                color: #fff !important;
                border: none;
                border-radius: 10px;
                font-weight: bold;
                font-size: 1.08rem;
                box-shadow: 0 2px 8px rgba(25,118,210,0.08);
                transition: background 0.3s, transform 0.2s;
                margin-top: 18px;
                margin-bottom: 8px;
                padding: 15px 0;
                width: 100%;
                max-width: 320px;
                letter-spacing: 0.5px;
            }
            .login-btn-full:hover {
                background: linear-gradient(90deg, #64b5f6 0%, #1976d2 100%) !important;
                color: #fff !important;
                transform: translateY(-2px) scale(1.04);
            }
            .error {
                color: #d32f2f;
                margin-top: 10px;
                text-align: center;
                width: 100%;
            }
            @media (max-width: 900px) {
                .login-form-full { min-height: 100vh; width: 100vw; padding: 0 2vw; }
                .input-group-full { max-width: 98vw; }
                .login-btn-full { max-width: 98vw; font-size: 1rem; padding: 12px 0; }
                .login-heading { font-size: 1.5rem; }
            }
            @media (max-width: 600px) {
                .login-form-full { padding: 0 2vw; }
                .input-group-full { max-width: 98vw; }
                .login-btn-full { max-width: 98vw; font-size: 0.95rem; }
                .login-heading { font-size: 1.2rem; }
            }
            </style>
        `;
    }

    const loginForm = document.getElementById('candidateLoginForm');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            candidate.email = document.getElementById('email').value;
            candidate.fullName = document.getElementById('fullName').value;
            if (!candidate.email || !candidate.fullName) {
                document.getElementById('loginError').innerText = 'Please enter all details.';
                return;
            }
            // Check submission status before allowing quiz access
            fetchQuizEventWithSubmissionCheck(quizId, candidate.email)
                .then(data => {
                    if (data.alreadySubmitted) {
                        loginContainer.innerHTML = `<div class='heading' style='color:red;'>You have already submitted this quiz. Multiple attempts are not allowed.</div>`;
                        return;
                    }
                    document.getElementById('loginContainer').style.display = 'none';
                    showQuizIntro();
                    logQuizActivity({
                        quizId,
                        userEmail: candidate.email,
                        userName: candidate.fullName,
                        actionType: "CandidateLogin",
                        details: {}
                    });
                });
        };
    }
});

function showQuizIntro() {
    const intro = document.getElementById('quizIntroContainer');
    // Parse instructions into array (support string or array)
    let instructionsArr = [];
    if (Array.isArray(quizData.instructions)) {
        instructionsArr = quizData.instructions;
    } else if (typeof quizData.instructions === 'string') {
        // Split by newlines or semicolons or periods for flexibility
        instructionsArr = quizData.instructions.split(/\n|;|\.|\r/).map(i => i.trim()).filter(i => i.length > 0);
    }
    // Fallback default instructions if none provided
    if (!instructionsArr.length) {
        instructionsArr = [
            'Complete the test within the allotted time.',
            'Ensure a stable internet connection.',
            'Do not navigate away from the test window.'
        ];
    }
    intro.innerHTML = `
        <div class="intro-card-full">
            <h2 class="intro-title">Welcome to <span class="event-title">${quizData.eventTitle}</span></h2>
            <div class="intro-section">
                <div class="intro-label">Instructions:</div>
                <ul class="instructions-list">
                    ${instructionsArr.map((ins, idx) => `<li class="instruction-item"><span class="instruction-num">${idx+1}.</span> <span class="instruction-text">${ins}</span></li>`).join('')}
                </div>
            </div>
            <div class="intro-section">
                <div class="intro-label">Total Duration:</div>
                <div class="intro-value">${duration} min</div>
            </div>
            <div class="intro-section">
                <div class="intro-label">Total Questions:</div>
                <div class="intro-value">${quizData.numQuestions}</div>
            </div>
            <button class='btn start-btn' id='startQuizBtn'>Start Quiz</button>
        </div>
        <style>
        .intro-card-full {
            width: 100vw;
            min-height: 100vh;
            background: #f5f7fa;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0;
        }
        .intro-title {
            font-size: 2rem;
            color: #1976d2;
            font-weight: bold;
            margin-bottom: 24px;
            text-align: center;
        }
        .event-title { color: #ff7043; font-weight: bold; }
        .intro-section { margin: 18px 0 10px 0; width: 100%; max-width: 480px; }
        .intro-label { font-weight: bold; color: #1976d2; display: block; margin-bottom: 8px; font-size: 1.08rem; }
        .instructions-list {
            list-style: none;
            padding: 0;
            margin: 0 0 12px 0;
        }
        .instruction-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 10px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 1px 4px rgba(25,118,210,0.04);
            padding: 12px 16px;
            font-size: 1.08rem;
        }
        .instruction-num {
            font-weight: bold;
            color: #1976d2;
            margin-right: 10px;
            min-width: 24px;
            text-align: right;
        }
        .instruction-text {
            color: #222;
            flex: 1;
        }
        .intro-value { display: inline-block; color: #333; font-size: 1.08rem; }
        .start-btn { background: #388e3c; color: #fff; font-weight: bold; font-size: 1.1rem; margin-top: 24px; padding: 14px 36px; border-radius: 10px; }
        .start-btn:hover { background: #2e7031; }
        @media (max-width: 900px) {
            .intro-card-full { padding: 0 2vw; }
            .intro-title { font-size: 1.5rem; }
            .intro-section { max-width: 98vw; }
            .instruction-item { font-size: 1rem; padding: 10px 10px; }
        }
        @media (max-width: 600px) {
            .intro-title { font-size: 1.2rem; }
            .intro-section { max-width: 98vw; }
            .instruction-item { font-size: 0.95rem; padding: 8px 6px; }
        }
        </style>
    `;
    intro.style.display = '';
    document.getElementById('startQuizBtn').onclick = function() {
        intro.style.display = 'none';
        startTime = Date.now();
        showQuizTest();
        logQuizActivity({
            quizId,
            userEmail: candidate.email,
            userName: candidate.fullName,
            actionType: "QuizStarted",
            details: {}
        });
    };
}

function showQuizTest() {
    const test = document.getElementById('quizTestContainer');
    test.style.display = '';
    let q = quizData.questions[currentQ];
    if (!answers.length) answers = Array(quizData.questions.length).fill(null);
    if (!visited.length) visited = Array(quizData.questions.length).fill(false);
    if (!markedForReview.length) markedForReview = Array(quizData.questions.length).fill(false);
    visited[currentQ] = true;

    // Left panel: question list and current question/answers
    let leftPanel = `<div class='question-list-panel'><div class='nav-title'>Questions</div>`;
    for (let i = 0; i < quizData.questions.length; i++) {
        let cls = 'question-list-num';
        if (i === currentQ) cls += ' current';
        else if (markedForReview[i]) cls += ' review';
        else if (visited[i]) cls += ' visited';
        else cls += ' not-visited';
        leftPanel += `<div class='${cls}' onclick='goToQuestion(${i})'>Q${i+1}</div>`;
    }
    leftPanel += `</div>
        <div class='question-block'>
            <div class='question-title'>Question ${currentQ+1} of ${quizData.numQuestions}</div>
            <div class='question-text'>${q.text}</div>
            <div class='options-list'>
                ${q.options.map((opt,i)=>`<div class='option-row'><input type='radio' name='answer' id='opt${i}' value='${i}' ${answers[currentQ]===i?'checked':''}/> <label for='opt${i}'>${typeof opt === 'string' ? opt : opt.text}</label></div>`).join('')}
            </div>
        </div>`;

    // Right panel: mark for review and clear response
    let rightPanel = `
        <div class='side-panel'>
            <button class='btn side-btn' id='markReviewBtn'>Mark for Review</button>
            <button class='btn side-btn' id='clearResponseBtn'>Clear Response</button>
        </div>
    `;

    // Timer at top
    let timerBar = `<div class='quiz-timer' id='quizTimer'></div>`;

    test.innerHTML = `
        <div class='quiz-top-bar'>${timerBar}</div>
        <div class='quiz-main-layout-full'>
            <div class='quiz-left'>${leftPanel}</div>
            <div class='quiz-right'>${rightPanel}</div>
        </div>
        <div class='quiz-controls-bottom-full'>
            <button class='btn' id='prevBtn' ${currentQ===0?'disabled':''}>Previous</button>
            <button class='btn' id='nextBtn' ${currentQ===quizData.questions.length-1?'disabled':''}>Next</button>
            <button class='btn submit-btn' id='submitBtn'>Submit</button>
        </div>
        <style>
        html, body { height: 100%; margin: 0; padding: 0; }
        #quizTestContainer { min-height: 100vh; width: 100vw; background: #f5f7fa; }
        .quiz-top-bar { width: 100vw; background: #e3f2fd; padding: 12px 0; text-align: center; position: sticky; top: 0; z-index: 10; }
        .quiz-timer { font-size: 1.2rem; color: #d84315; font-weight: bold; background: #fff3e0; border-radius: 8px; padding: 6px 18px; display: inline-block; }
        .quiz-main-layout-full { display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; min-height: 70vh; width: 100vw; }
        .quiz-left { flex: 1.5; min-width: 220px; padding: 0 0 0 18px; background: none; }
        .quiz-right { flex: 0.7; min-width: 160px; padding: 0 18px 0 0; background: none; display: flex; flex-direction: column; align-items: flex-end; }
        .question-list-panel { margin-bottom: 18px; }
        .nav-title { font-weight: bold; color: #1976d2; margin-bottom: 8px; text-align: left; }
        .question-list-num { display: inline-block; width: 38px; height: 38px; line-height: 38px; border-radius: 8px; margin: 4px 4px 4px 0; text-align: center; font-weight: bold; cursor: pointer; background: #e3f2fd; color: #1976d2; border: 2px solid #e3f2fd; transition: all 0.2s; }
        .question-list-num.current { background: #1976d2; color: #fff; border: 2px solid #1976d2; }
        .question-list-num.visited { background: #c8e6c9; color: #333; border: 2px solid #388e3c; }
        .question-list-num.review { background: #fff59d; color: #333; border: 2px solid #fbc02d; }
        .question-list-num.not-visited { background: #e3f2fd; color: #aaa; border: 2px solid #e3f2fd; }
        .question-block { margin-top: 18px; }
        .question-title { font-size: 1.1rem; color: #1976d2; margin-bottom: 8px; }
        .question-text { font-size: 1.15rem; margin: 12px 0 10px 0; color: #222; text-align:left; font-weight:500; }
        .options-list { margin-bottom: 18px; text-align:left; }
        .option-row { margin: 8px 0; font-size: 1.08rem; background:none; border-radius:0; padding:8px 0; box-shadow:none; }
        .option-row input[type='radio'] { margin-right:8px; }
        .quiz-controls-bottom-full { display: flex; gap: 12px; justify-content: center; position: fixed; left: 0; bottom: 0; width: 100vw; background: #fff; box-shadow: 0 -2px 8px rgba(25,118,210,0.08); padding: 16px 0; z-index: 20; }
        .side-panel { display: flex; flex-direction: column; gap: 12px; align-items: flex-end; margin-top: 40px; }
        .side-btn { background: #ffe082; color: #d84315; border: 1px solid #ff7043; font-weight: bold; }
        .submit-btn { background: #388e3c; color: #fff; font-weight: bold; }
        @media (max-width: 900px) {
            .quiz-main-layout-full { flex-direction: column; align-items: stretch; min-height: auto; width: 100vw; }
            .quiz-left, .quiz-right { width: 98vw; min-width: 0; max-width: 98vw; padding: 0 2vw; }
            .quiz-right { align-items: stretch; margin-top: 18px; }
            .quiz-controls-bottom-full { position: fixed; left: 0; bottom: 0; width: 100vw; padding: 12px 0; }
        }
        @media (max-width: 600px) {
            .quiz-left, .quiz-right { padding: 8px 2vw; }
            .question-list-num { width: 28px; height: 28px; line-height: 28px; font-size: 0.95rem; }
            .quiz-controls-bottom-full { padding: 8px 0; }
        }
        </style>
    `;
    document.querySelectorAll('input[name="answer"]').forEach(input => {
        input.onchange = function() {
            answers[currentQ] = parseInt(this.value);
            logQuizActivity({
                quizId,
                userEmail: candidate.email,
                userName: candidate.fullName,
                actionType: "QuestionAnswered",
                details: { questionIndex: currentQ, answer: this.value }
            });
            updateScoreRealtime(); // <-- Real-time score update
        };
    });
    document.getElementById('markReviewBtn').onclick = function() {
        markedForReview[currentQ] = true;
        showQuizTest();
    };
    document.getElementById('clearResponseBtn').onclick = function() {
        answers[currentQ] = null;
        showQuizTest();
    };
    document.getElementById('prevBtn').onclick = function() {
        if (currentQ > 0) { currentQ--; showQuizTest(); }
    };
    document.getElementById('nextBtn').onclick = function() {
        if (currentQ < quizData.questions.length-1) { currentQ++; showQuizTest(); }
    };
    document.getElementById('submitBtn').onclick = function() {
        document.getElementById('popupConfirm').style.display = '';
        const popup = document.getElementById('popupConfirm');
        popup.style.display = '';
        document.getElementById('popupMsg').innerHTML = `<span style='font-size:1.2rem;'>Are you sure you want to submit the test?</span>`;
        // Style and show Yes/No buttons
        document.getElementById('popupYes').style.display = '';
        document.getElementById('popupNo').style.display = '';
        document.getElementById('popupYes').className = 'btn popup-btn-yes';
        document.getElementById('popupNo').className = 'btn popup-btn-no';
        // Responsive popup styling
        popup.querySelector('.popup-content').style.display = 'flex';
        popup.querySelector('.popup-content').style.flexDirection = 'column';
        popup.querySelector('.popup-content').style.alignItems = 'center';
        popup.querySelector('.popup-content').style.justifyContent = 'center';
        popup.querySelector('.popup-content').style.padding = '32px 24px';
        popup.querySelector('.popup-content').style.background = '#fff';
        popup.querySelector('.popup-content').style.borderRadius = '16px';
        popup.querySelector('.popup-content').style.boxShadow = '0 4px 24px rgba(25,118,210,0.12)';
        popup.querySelector('.popup-content').style.maxWidth = '340px';
        popup.querySelector('.popup-content').style.margin = 'auto';
        document.getElementById('popupMsg').style.marginBottom = '24px';
        document.getElementById('popupYes').style.margin = '0 0 12px 0';
        document.getElementById('popupNo').style.margin = '0';
        // Add responsive CSS
        if (!document.getElementById('popupConfirmStyle')) {
            const style = document.createElement('style');
            style.id = 'popupConfirmStyle';
            style.innerHTML = `
            @media (max-width: 600px) {
                #popupConfirm .popup-content { max-width: 98vw !important; padding: 18px 6vw !important; }
                #popupConfirm { left: 0 !important; right: 0 !important; }
                #popupMsg { font-size: 1rem !important; }
                .popup-btn-yes, .popup-btn-no { font-size: 1rem !important; padding: 12px 0 !important; }
            }
            #popupConfirm { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(25,118,210,0.10); z-index: 9999; display: flex; align-items: center; justify-content: center; }
            .popup-content { box-sizing: border-box; }
            .popup-btn-yes { background: #388e3c; color: #fff; font-weight: bold; border-radius: 8px; width: 100%; max-width: 220px; padding: 14px 0; font-size: 1.08rem; border: none; margin-bottom: 10px; }
            .popup-btn-no { background: #fff; color: #1976d2; font-weight: bold; border-radius: 8px; width: 100%; max-width: 220px; padding: 14px 0; font-size: 1.08rem; border: 2px solid #1976d2; }
            .popup-btn-yes:hover { background: #2e7031; }
            .popup-btn-no:hover { background: #e3f2fd; color: #1976d2; }
            `;
            document.head.appendChild(style);
        }
        document.getElementById('popupYes').onclick = function() {
            document.getElementById('popupConfirm').style.display = 'none';
            popup.style.display = 'none';
            document.getElementById('quizTestContainer').style.display = 'none';
            // Calculate and submit score
            const result = calculateScore(answers, quizData.questions);
            fetch('/api/quiz/submit-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId,
                    email: candidate.email,
                    fullName: candidate.fullName,
                    score: result.score,
                    rightAnswers: result.rightAnswers,
                    wrongAnswers: result.wrongAnswers
                })
            })
            .then(res => res.json())
            .then(scoreResult => {
                showScore(scoreResult);
                setTimeout(() => {
                    showFeedbackForm();
                }, 2500);
            })
            .catch(() => {
                showFeedbackForm();
            });
        };
        document.getElementById('popupNo').onclick = function() {
            document.getElementById('popupConfirm').style.display = 'none';
            popup.style.display = 'none';
        };
    };
    // Timer logic (auto-submit on timeout)
    if (!window.quizTimerInterval) {
        let timeLeft = duration * 60; // seconds
        const timerEl = document.getElementById('quizTimer');
        window.quizTimerInterval = setInterval(() => {
            if (timerEl) {
                const min = Math.floor(timeLeft / 60);
                const sec = timeLeft % 60;
                timerEl.textContent = `Time Left: ${min}:${sec.toString().padStart(2, '0')}`;
            }
            if (--timeLeft < 0) {
                clearInterval(window.quizTimerInterval);
                window.quizTimerInterval = null;
                // Auto-submit the quiz if time is up
                autoSubmitQuiz();
            }
        }, 1000);
    }
}

function autoSubmitQuiz() {
    // Disable quiz UI and show auto-submit message
    document.getElementById('quizTestContainer').innerHTML = `
        <div class="auto-submit-msg">
            <h2>? Time's Up!</h2>
            <p>Your quiz time is over. Submitting your answers...</p>
        </div>
        <style>
        .auto-submit-msg { text-align: center; margin-top: 60px; }
        .auto-submit-msg h2 { color: #ff7043; font-size: 2rem; }
        .auto-submit-msg p { color: #333; font-size: 1.2rem; margin-top: 18px; }
        </style>
    `;
    setTimeout(() => {
        // Calculate and submit score
        const result = calculateScore(answers, quizData.questions);
        fetch('/api/quiz/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quizId,
                email: candidate.email,
                fullName: candidate.fullName,
                score: result.score,
                rightAnswers: result.rightAnswers,
                wrongAnswers: result.wrongAnswers
            })
        })
        .then(res => res.json())
        .then(scoreResult => {
            showScore(scoreResult);
            setTimeout(() => {
                showFeedbackForm();
            }, 2500);
        })
        .catch(() => {
            showFeedbackForm();
        });
    }, 1800);
}

window.goToQuestion = function(i) {
    currentQ = i;
    showQuizTest();
};

// Calculate score and right/left answers
function calculateScore(answers, questions) {
    let score = 0;
    let rightAnswers = [], wrongAnswers = [];
    answers.forEach((ans, idx) => {
        if (ans === null) return; // No answer
        let question = questions[idx];
        if (ans == question.correctOption) {
            score += question.score;
            rightAnswers.push(idx + 1);
        } else {
            wrongAnswers.push(idx + 1);
        }
    });
    return { score, rightAnswers, wrongAnswers };
}

// Show score and stats
function showScore(result) {
    const score = document.getElementById('scoreContainer');
    let correctAnswersHtml = '';
    if (quizData && quizData.questions) {
        correctAnswersHtml = `<div class='score-details'><b>Correct Answers:</b><ul>` +
            quizData.questions.map((q, idx) => `<li>Q${idx+1}: ${q.correctOption}</li>`).join('') + '</ul></div>';
    }
    score.innerHTML = `
        <div class="score-card">
            <h2>? Quiz Submitted!</h2>
            <div class="score-main">Your Score: <span class="score-value">${result.score}</span></div>
            <div class="score-details">
                <div><span class="right">? Right Answers:</span> ${result.rightAnswers.join(', ') || '-'}</div>
                <div><span class="wrong">? Wrong Answers:</span> ${result.wrongAnswers.join(', ') || '-'}</div>
            </div>
            ${correctAnswersHtml}
            <div class="score-thank">Thank you for participating!</div>
        </div>
        <style>
        .score-card {
            background: #fff8e1;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            padding: 32px 24px;
            max-width: 400px;
            margin: 40px auto 0 auto;
            text-align: center;
            font-family: 'Fredoka', sans-serif;
        }
        .score-main {
            font-size: 2.2rem;
            color: #ff7043;
            margin: 18px 0 10px 0;
        }
        .score-value {
            font-weight: bold;
            color: #388e3c;
        }
        .score-details {
            margin: 18px 0 10px 0;
            font-size: 1.1rem;
        }
        .score-details .right { color: #388e3c; font-weight: bold; }
        .score-details .wrong { color: #d32f2f; font-weight: bold; }
        .score-thank {
            margin-top: 18px;
            color: #ff7043;
            font-size: 1.1rem;
        }
        </style>
    `;
    score.style.display = '';
}

function showFeedbackForm() {
    const feedback = document.getElementById('feedbackContainer');
    let feedbackQuestions = [];
    try {
        feedbackQuestions = JSON.parse(quizData.feedbackForm);
    } catch {
        if (quizData.feedbackForm && typeof quizData.feedbackForm === 'string') {
            feedbackQuestions = [quizData.feedbackForm];
        }
    }
    if (!Array.isArray(feedbackQuestions)) feedbackQuestions = [feedbackQuestions];
    feedback.innerHTML = `
        <div class="feedback-card-full">
            <h2 class="feedback-title">Quiz Feedback</h2>
            <form id='candidateFeedbackForm'>
                ${feedbackQuestions.map((q, idx) => `
                    <div class='feedback-q'>
                        <label class='feedback-label'>${q}</label>
                        <div class='star-rating' data-idx='${idx}'>
                            ${[1,2,3,4,5].map(star => `<span class='star' data-star='${star}' data-idx='${idx}'>&#9733;</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class='feedback-q'>
                    <label class='feedback-label'>Additional Comments</label>
                    <textarea id='candidateFeedback' placeholder='Enter your feedback...'></textarea>
                </div>
                <button class='btn feedback-submit-btn' id='submitFeedbackBtn' type='submit'>Submit Feedback</button>
            </form>
        </div>
        <style>
        .feedback-card-full {
            width: 100vw;
            min-height: 100vh;
            background: #f5f7fa;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0;
        }
        .feedback-title {
            font-size: 2rem;
            color: #1976d2;
            font-weight: bold;
            margin-bottom: 24px;
            text-align: center;
        }
        .feedback-q { margin-bottom: 18px; text-align:left; max-width: 480px; }
        .feedback-label { color: #1976d2; font-weight: 500; margin-bottom: 6px; font-size: 1.08rem; display:block; }
        .star-rating { font-size: 1.6rem; color: #ccc; cursor: pointer; user-select: none; }
        .star.selected { color: #ffb300; }
        .star { transition: color 0.2s; margin-right: 4px; }
        .star:hover, .star.hovered { color: #ffd54f; }
        #candidateFeedback { width: 100%; min-height: 60px; border-radius: 8px; border: 1px solid #b0bec5; padding: 10px; font-size: 1rem; }
        .feedback-submit-btn { background: #388e3c; color: #fff; font-weight: bold; font-size: 1.08rem; border-radius: 10px; padding: 14px 0; width: 100%; max-width: 320px; margin-top: 18px; }
        .feedback-submit-btn:hover { background: #2e7031; }
        @media (max-width: 900px) {
            .feedback-card-full { padding: 0 2vw; }
            .feedback-title { font-size: 1.5rem; }
            .feedback-q { max-width: 98vw; }
            .feedback-submit-btn { max-width: 98vw; font-size: 1rem; padding: 12px 0; }
        }
        @media (max-width: 600px) {
            .feedback-card-full { padding: 0 2vw; }
            .feedback-title { font-size: 1.2rem; }
            .feedback-q { max-width: 98vw; }
            .feedback-submit-btn { max-width: 98vw; font-size: 0.95rem; }
        }
        </style>
    `;
    feedback.style.display = '';
    document.getElementById('scoreContainer').style.display = 'none';

    // Interactive star rating logic
    const ratings = Array(feedbackQuestions.length).fill(0);
    document.querySelectorAll('.star-rating').forEach((el, idx) => {
        el.addEventListener('mouseover', function(e) {
            if (e.target.classList.contains('star')) {
                const star = parseInt(e.target.getAttribute('data-star'));
                [...el.children].forEach((s, i) => {
                    s.classList.toggle('hovered', i < star);
                });
            }
        });
        el.addEventListener('mouseout', function() {
            [...el.children].forEach((s, i) => {
                s.classList.remove('hovered');
            });
        });
        el.addEventListener('click', function(e) {
            if (e.target.classList.contains('star')) {
                const star = parseInt(e.target.getAttribute('data-star'));
                ratings[idx] = star;
                [...el.children].forEach((s, i) => {
                    s.classList.toggle('selected', i < star);
                });
            }
        });
    });

    document.getElementById('candidateFeedbackForm').onsubmit = function(e) {
        e.preventDefault();
        const feedbackText = document.getElementById('candidateFeedback').value;
        // Submit feedback answers and ratings to backend
        fetch(`/api/QuizHost/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quizId,
                feedback: JSON.stringify({
                    questions: feedbackQuestions,
                    ratings,
                    comments: feedbackText
                }),
                email: candidate.email,
                fullName: candidate.fullName
            })
        })
        .then(res => res.json())
        .then(result => {
            showThankYouMessage();
            logQuizActivity({
                quizId,
                userEmail: candidate.email,
                userName: candidate.fullName,
                actionType: "FeedbackSubmitted",
                details: { feedback: feedbackText, ratings }
            });
        });
    };
}

function showThankYouMessage() {
    const feedback = document.getElementById('feedbackContainer');
    feedback.innerHTML = `
        <div class="thankyou-card-full">
            <h2 class="thankyou-title">Thank You!</h2>
            <div class="thankyou-msg">Your feedback has been submitted.<br>We appreciate your input.</div>
        </div>
        <style>
        .thankyou-card-full {
            width: 100vw;
            min-height: 100vh;
            background: #f5f7fa;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .thankyou-title {
            font-size: 2rem;
            color: #388e3c;
            font-weight: bold;
            margin-bottom: 24px;
            text-align: center;
        }
        .thankyou-msg {
            font-size: 1.15rem;
            color: #1976d2;
            text-align: center;
            background: #e3f2fd;
            border-radius: 10px;
            padding: 18px 24px;
            max-width: 400px;
        }
        @media (max-width: 900px) {
            .thankyou-title { font-size: 1.5rem; }
            .thankyou-msg { font-size: 1rem; padding: 12px 8vw; max-width: 98vw; }
        }
        @media (max-width: 600px) {
            .thankyou-title { font-size: 1.2rem; }
            .thankyou-msg { font-size: 0.95rem; padding: 8px 4vw; max-width: 98vw; }
        }
        </style>
    `;
    feedback.style.display = '';
}

// SignalR real-time updates
let quizHubConnection = null;
function setupQuizHubSignalR(quizId, candidateEmail) {
    if (window.signalR && window.signalR.HubConnection) {
        quizHubConnection = new window.signalR.HubConnectionBuilder()
            .withUrl(`/quizHub?quizId=${quizId}`)
            .build();
        quizHubConnection.on('LeaderboardUpdated', data => {
            // Optionally update leaderboard UI for candidates
            if (window.updateCandidateLeaderboard) {
                window.updateCandidateLeaderboard(data);
            }
        });
        quizHubConnection.start();
    }
}

// Call setupQuizHubSignalR after login
window.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    if (quizId && candidate.email) {
        setupQuizHubSignalR(quizId, candidate.email);
    }
});

// Real-time score update on answer
function updateScoreRealtime() {
    const scoreObj = calculateScore(answers, quizData.questions);
    if (quizHubConnection && quizHubConnection.invoke) {
        quizHubConnection.invoke('UpdateScore', quizId, candidate.email, scoreObj.score);
    }
}

// Update leaderboard UI for candidates (optional)
window.updateCandidateLeaderboard = function(data) {
    const container = document.getElementById('candidateLeaderboardContainer');
    if (!container) return;
    container.style.display = '';
    container.innerHTML = `
        <h3>Live Leaderboard</h3>
        <table>
            <thead>
                <tr><th>Rank</th><th>Name</th><th>Score</th></tr>
            </thead>
            <tbody>
                ${data.map((entry, idx) => `
                    <tr>
                        <td>${idx+1}</td>
                        <td>${entry.fullName || entry.email}</td>
                        <td>${entry.score}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};
