// Home page navigation logic for Host and Candidate buttons

document.addEventListener('DOMContentLoaded', function() {
    const hostBtn = document.getElementById('hostBtn');
    const candidateBtn = document.getElementById('candidateBtn');
    const landingCard = document.getElementById('landingCard');
    const hostQuizCard = document.getElementById('hostQuizCard');
    const startQuestionsBtn = document.getElementById('startQuestionsBtn');
    const questionsCard = document.getElementById('questionsCard');
    const feedbackCard = document.getElementById('feedbackCard');
    const linkCard = document.getElementById('linkCard');

    if (hostBtn) {
        hostBtn.onclick = function() {
            landingCard.style.display = 'none';
            hostQuizCard.style.display = '';
        };
    }
    if (candidateBtn) {
        candidateBtn.onclick = function() {
            window.location.href = 'candidate.html';
        };
    }
    if (startQuestionsBtn) {
        startQuestionsBtn.onclick = function() {
            hostQuizCard.style.display = 'none';
            questionsCard.style.display = '';
            feedbackCard.style.display = 'none';
            linkCard.style.display = 'none';
            // Full-screen, responsive layout for question form
            questionsCard.innerHTML = `
                <div class="questions-full-layout">
                    <h2 class="questions-title">Add Your Questions</h2>
                    <form id="questionForm" class="questions-form-grid">
                        <div class="form-row">
                            <label for="questionText">Question</label>
                            <input type="text" id="questionText" required placeholder="Enter question text" />
                        </div>
                        <div class="form-row options-row">
                            <label>Options</label>
                            <input type="text" id="option1" required placeholder="Option 1" />
                            <input type="text" id="option2" required placeholder="Option 2" />
                            <input type="text" id="option3" required placeholder="Option 3" />
                            <input type="text" id="option4" required placeholder="Option 4" />
                        </div>
                        <div class="form-row">
                            <label for="correctOption">Correct Option (1-4)</label>
                            <input type="number" id="correctOption" min="1" max="4" required />
                        </div>
                        <div class="form-row">
                            <label for="score">Score</label>
                            <input type="number" id="score" min="1" max="100" value="1" required />
                        </div>
                        <div class="form-row">
                            <label for="difficulty">Difficulty</label>
                            <select id="difficulty" required>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <button class="btn" type="submit">Add Question</button>
                        </div>
                    </form>
                    <div id="questionProgress" class="questions-progress"></div>
                </div>
                <style>
                .questions-full-layout {
                    width: 100vw;
                    min-height: 100vh;
                    background: #f5f7fa;
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    justify-content: flex-start;
                    padding: 0;
                }
                .questions-title {
                    font-size: 2rem;
                    color: #1976d2;
                    font-weight: bold;
                    margin: 32px 0 24px 0;
                    text-align: left;
                    padding-left: 4vw;
                }
                .questions-form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px 32px;
                    width: 96vw;
                    max-width: 1200px;
                    margin: 0 auto;
                    background: none;
                    padding: 0 2vw;
                }
                .form-row {
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    margin-bottom: 0;
                }
                .form-row label {
                    color: #1976d2;
                    font-weight: 500;
                    margin-bottom: 8px;
                    font-size: 1.08rem;
                }
                .form-row input, .form-row select {
                    border: 1.5px solid #b0bec5;
                    background: #fff;
                    color: #222;
                    border-radius: 10px;
                    padding: 14px 16px;
                    font-size: 1.08rem;
                    margin-bottom: 0;
                    transition: border 0.2s, box-shadow 0.2s;
                    box-shadow: 0 1px 4px rgba(25,118,210,0.04);
                }
                .form-row input:focus, .form-row select:focus {
                    border: 1.5px solid #1976d2;
                    outline: none;
                    box-shadow: 0 0 0 2px #90caf9aa;
                }
                .options-row {
                    grid-column: span 2;
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr 1fr;
                    gap: 12px;
                    align-items: end;
                }
                .options-row label {
                    grid-column: 1 / span 4;
                    margin-bottom: 8px;
                }
                .questions-progress {
                    font-weight: bold;
                    margin: 24px 0 0 4vw;
                    font-size: 1.1rem;
                    color: #388e3c;
                }
                @media (max-width: 900px) {
                    .questions-title { font-size: 1.5rem; padding-left: 2vw; }
                    .questions-form-grid { grid-template-columns: 1fr; gap: 18px 0; width: 98vw; max-width: 98vw; padding: 0 1vw; }
                    .options-row { grid-template-columns: 1fr 1fr; gap: 10px; }
                }
                @media (max-width: 600px) {
                    .questions-title { font-size: 1.2rem; padding-left: 2vw; }
                    .questions-form-grid { grid-template-columns: 1fr; gap: 12px 0; width: 99vw; max-width: 99vw; padding: 0 1vw; }
                    .options-row { grid-template-columns: 1fr; gap: 8px; }
                }
                </style>
            `;

            const questionForm = document.getElementById('questionForm');
            const questionProgress = document.getElementById('questionProgress');
            let questions = [];
            const numQuestions = parseInt(document.getElementById('numQuestions').value);
            const eventTitle = document.getElementById('eventTitle').value;
            const instructions = document.getElementById('instructions').value;
            const duration = parseInt(document.getElementById('duration').value);

            function updateProgress() {
                questionProgress.textContent = `Questions added: ${questions.length} / ${numQuestions}`;
            }

            updateProgress();

            questionForm.onsubmit = function(e) {
                e.preventDefault();
                const qText = document.getElementById('questionText').value.trim();
                const opts = [1,2,3,4].map(i => document.getElementById('option'+i).value.trim());
                const correct = parseInt(document.getElementById('correctOption').value);
                const score = parseInt(document.getElementById('score').value);
                const difficulty = document.getElementById('difficulty').value;
                if (!qText || opts.some(o => !o) || !(correct >= 1 && correct <= 4) || !score || !difficulty) {
                    alert('Please fill all fields correctly.');
                    return;
                }
                questions.push({
                    Text: qText,
                    Options: opts.map(o => ({ Text: o })),
                    CorrectOption: correct.toString(), // <-- Store as index string for DB compatibility
                    Number: score,
                    Difficulty: difficulty
                });
                updateProgress();
                questionForm.reset();
                if (questions.length === numQuestions) {
                    // All questions added, show feedback form
                    questionsCard.style.display = 'none';
                    showFeedbackForm();
                }
            };

            function showFeedbackForm() {
                feedbackCard.style.display = '';
                feedbackCard.innerHTML = `
                    <h2>Add Feedback Questions</h2>
                    <form id="feedbackForm">
                        <div class="input-group">
                            <label for="feedbackQ1">Feedback Question 1</label>
                            <input type="text" id="feedbackQ1" required placeholder="e.g. How was the quiz experience?" />
                        </div>
                        <div class="input-group">
                            <label for="feedbackQ2">Feedback Question 2</label>
                            <input type="text" id="feedbackQ2" placeholder="(Optional)" />
                        </div>
                        <div class="input-group">
                            <label for="feedbackQ3">Feedback Question 3</label>
                            <input type="text" id="feedbackQ3" placeholder="(Optional)" />
                        </div>
                        <button class="btn" type="submit">Create Quiz</button>
                    </form>
                `;
                document.getElementById('feedbackForm').onsubmit = function(e) {
                    e.preventDefault();
                    const feedbackQuestions = [
                        document.getElementById('feedbackQ1').value.trim(),
                        document.getElementById('feedbackQ2').value.trim(),
                        document.getElementById('feedbackQ3').value.trim()
                    ].filter(q => q);
                    createQuiz(feedbackQuestions);
                };
            }

            // Add QR code generation for quiz link
            function showQuizLinkWithQRCode(link) {
                linkCard.innerHTML = `
                    <div style='font-size:1.2rem;margin-bottom:18px;'>Quiz Created Successfully!</div>
                    <div style='margin-bottom:10px;'><b>Quiz Link:</b></div>
                    <input id='quizLinkInput' style='width:90%;padding:8px;font-size:1rem;' value='${link}' readonly />
                    <div id='qrCodeContainer' style='margin:18px 0; display:flex; justify-content:center;'></div>
                    <button class='btn' id='copyQuizLinkBtn' style='margin-top:12px;'>Copy Link</button>
                    <button class='btn' id='regenerateQRCodeBtn' style='margin-top:12px;'>Regenerate QR Code</button>
                    <script src='https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js'></script>
                    <style>
                        #qrCodeContainer canvas { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 2px 8px rgba(25,118,210,0.08); }
                        @media (max-width: 900px) { #qrCodeContainer canvas { width: 180px !important; height: 180px !important; } }
                        @media (max-width: 600px) { #qrCodeContainer canvas { width: 120px !important; height: 120px !important; } }
                    </style>
                `;
                // Ensure QRious is loaded before generating QR code
                function renderQRCode() {
                    let size = 220;
                    if (window.innerWidth < 600) size = 120;
                    else if (window.innerWidth < 900) size = 180;
                    const qr = new window.QRious({
                        element: document.createElement('canvas'),
                        value: link,
                        size: size,
                        background: 'white',
                        foreground: '#1976d2',
                        level: 'H'
                    });
                    const qrCodeContainer = document.getElementById('qrCodeContainer');
                    qrCodeContainer.innerHTML = '';
                    qrCodeContainer.appendChild(qr.element);
                    document.getElementById('regenerateQRCodeBtn').onclick = function() {
                        qr.set({ value: link });
                    };
                }
                // If QRious is not loaded yet, wait for it
                if (typeof window.QRious === 'undefined') {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js';
                    script.onload = renderQRCode;
                    document.body.appendChild(script);
                } else {
                    renderQRCode();
                }
                document.getElementById('copyQuizLinkBtn').onclick = function() {
                    const input = document.getElementById('quizLinkInput');
                    input.select();
                    input.setSelectionRange(0, 99999);
                    document.execCommand('copy');
                    this.textContent = 'Copied!';
                    setTimeout(() => { this.textContent = 'Copy Link'; }, 1500);
                };
            }

            function createQuiz(feedbackQuestions) {
                feedbackCard.style.display = 'none';
                linkCard.style.display = '';
                linkCard.innerHTML = `<div style='font-size:1.2rem;margin-bottom:18px;'>Creating quiz...</div>`;
                fetch('/api/QuizHost/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        EventTitle: eventTitle,
                        Instructions: instructions,
                        Duration: duration,
                        NumQuestions: numQuestions,
                        Questions: questions,
                        FeedbackForm: JSON.stringify(feedbackQuestions)
                    })
                })
                .then(res => res.json())
                .then(data => {
                    showQuizLinkWithQRCode(data.link);
                })
                .catch(() => {
                    linkCard.innerHTML = `<div style='color:red;'>Failed to create quiz. Please try again.</div>`;
                });
            }
        };
    }
});

// Host Dashboard logic
function showHostDashboardUI() {
    // Hide landing card and host/candidate buttons
    const landingCard = document.getElementById('landingCard');
    if (landingCard) landingCard.style.display = 'none';
    // Hide hostQuizCard if visible
    const hostQuizCard = document.getElementById('hostQuizCard');
    if (hostQuizCard) hostQuizCard.style.display = 'none';
    // Create dashboard container if not present
    let dashboard = document.getElementById('hostDashboardContainer');
    if (!dashboard) {
        dashboard = document.createElement('div');
        dashboard.id = 'hostDashboardContainer';
        document.body.appendChild(dashboard);
    }
    dashboard.innerHTML = `
        <div class="host-dashboard-full">
            <h2 class="dashboard-title dashboard-animated">Host Dashboard</h2>
            <div class="dashboard-btn-row">
                <button class="btn dashboard-btn" id="viewLeaderboardBtn">View Leaderboard</button>
                <button class="btn dashboard-btn" id="startQuestionsBtnDashboard">Start Adding Questions</button>
            </div>
        </div>
        <style>
        .host-dashboard-full { width: 100vw; min-height: 100vh; background: #f5f7fa; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 0; }
        .dashboard-title { font-size: 2rem; color: #1976d2; font-weight: bold; margin: 40px 0 24px 0; text-align: center; }
        .dashboard-animated {
            animation: dashboardFadeIn 1.2s cubic-bezier(.42,0,.58,1) 0s 1;
        }
        @keyframes dashboardFadeIn {
            0% { opacity: 0; transform: translateY(-30px) scale(0.98); }
            60% { opacity: 1; transform: translateY(10px) scale(1.04); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dashboard-btn-row { display: flex; gap: 32px; justify-content: center; margin-top: 32px; }
        .dashboard-btn { font-size: 1.15rem; font-weight: bold; border-radius: 10px; padding: 18px 36px; background: #1976d2; color: #fff; border: none; box-shadow: 0 2px 8px rgba(25,118,210,0.08); transition: background 0.3s, transform 0.2s; }
        .dashboard-btn:hover { background: #1565c0; transform: translateY(-2px) scale(1.04); }
        @media (max-width: 900px) { .dashboard-title { font-size: 1.5rem; } .dashboard-btn-row { gap: 18px; } .dashboard-btn { font-size: 1rem; padding: 14px 18px; } }
        @media (max-width: 600px) { .dashboard-title { font-size: 1.2rem; } .dashboard-btn-row { flex-direction: column; gap: 18px; } .dashboard-btn { font-size: 0.95rem; padding: 12px 8px; } }
        </style>
    `;
    dashboard.style.display = '';
    // Button actions
    document.getElementById('viewLeaderboardBtn').onclick = function() {
        dashboard.style.display = 'none';
        // Show leaderboard (reuse showHostDashboard from leaderboard.js)
        let quizId = localStorage.getItem('quizId') || '';
        if (quizId) {
            window.showHostDashboard(quizId);
        }
    };
    document.getElementById('startQuestionsBtnDashboard').onclick = function() {
        dashboard.style.display = 'none';
        // Show question creation UI
        document.getElementById('hostQuizCard').style.display = '';
    };
}

// Host login redirect logic
function redirectToHostDashboard() {
    showHostDashboardUI();
}

// Listen for host login event (simulate after login)
window.addEventListener('DOMContentLoaded', function() {
    // If host login detected, redirect to dashboard
    if (window.location.pathname.endsWith('home.html') && localStorage.getItem('hostLoggedIn')) {
        redirectToHostDashboard();
    }
});
