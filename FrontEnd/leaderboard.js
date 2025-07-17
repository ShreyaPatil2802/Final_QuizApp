document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.querySelector("#leaderboard-table tbody");

    try {
        const res = await fetch("/api/quiz/leaderboard");
        const data = await res.json();

        data.forEach((entry, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${index + 1}</td><td>${entry.username}</td><td>${entry.score}</td>`;
            tbody.appendChild(row);
        });
    } catch (err) {
        tbody.innerHTML = "<tr><td colspan='3'>Failed to load leaderboard.</td></tr>";
        console.error(err);
    }
});


document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.querySelector("#leaderboard-table tbody");
    const congrats = document.getElementById("congrats-message");

    try {
        const res = await fetch("/api/quiz/leaderboard");
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5'>No scores yet.</td></tr>";
            return;
        }

        data.forEach((entry, index) => {
            const row = document.createElement("tr");
            const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${entry.email || entry.username}`;
            row.innerHTML = `
                <td>${index + 1}</td>
                <td class="username-cell">
                    <img src="${avatarUrl}" alt="avatar" class="avatar" />
                    ${entry.email || entry.username}
                </td>
                <td>${entry.firstName}</td>
                <td>${entry.lastName}</td>
                <td>${entry.score}</td>
            `;
            tbody.appendChild(row);
        });

        congrats.textContent = `🎉 Congratulations ${data[0].firstName} ${data[0].lastName} for securing the top rank!`;
    } catch (err) {
        tbody.innerHTML = "<tr><td colspan='5'>Failed to load leaderboard.</td></tr>";
        console.error("Leaderboard fetch error:", err);
    }
});

// Host Dashboard: Live Leaderboard + Close Quiz
function showHostDashboard(quizId) {
    const dashboard = document.getElementById('hostDashboardContainer');
    dashboard.innerHTML = `
        <div class="dashboard-card-full">
            <h2 class="dashboard-title dashboard-animated">Host Dashboard</h2>
            <div class="dashboard-section">
                <button class="btn close-quiz-btn" id="closeQuizBtn">Close Quiz Session</button>
            </div>
            <div class="dashboard-section">
                <h3>Live Leaderboard</h3>
                <table class="leaderboard-table" id="hostLeaderboardTable">
                    <thead>
                        <tr><th>Rank</th><th>Full Name</th><th>Email</th><th>Score</th><th>Time</th><th>Difficulty</th><th>Badge</th></tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
            <div class="dashboard-section">
                <h3>Live Feedback Responses</h3>
                <div id="hostFeedbackDashboard"></div>
            </div>
        </div>
        <style>
        .dashboard-card-full { width: 100vw; min-height: 100vh; background: #f5f7fa; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 0; }
        .dashboard-title { font-size: 2rem; color: #1976d2; font-weight: bold; margin: 32px 0 24px 0; text-align: center; animation: dashboardFadeIn 1.2s cubic-bezier(.42,0,.58,1) 0s 1; }
        @keyframes dashboardFadeIn { 0% { opacity: 0; transform: translateY(-30px) scale(0.98); } 60% { opacity: 1; transform: translateY(10px) scale(1.04); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .dashboard-section { margin-bottom: 32px; width: 100%; max-width: 600px; }
        .close-quiz-btn { background: #d32f2f; color: #fff; font-weight: bold; font-size: 1.1rem; border-radius: 10px; padding: 14px 36px; margin-bottom: 18px; }
        .close-quiz-btn:hover { background: #b71c1c; }
        .leaderboard-table { width: 100%; border-collapse: collapse; margin-top: 18px; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(25,118,210,0.08); }
        .leaderboard-table th, .leaderboard-table td { padding: 10px 8px; text-align: center; border-bottom: 1px solid #eee; }
        .leaderboard-table th { background: #e3f2fd; color: #1976d2; font-weight: bold; }
        .badge-icon { font-size: 1.5rem; }
        .feedback-entry { background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(25,118,210,0.08); margin: 18px 0; padding: 18px 16px; max-width: 600px; width: 98vw; }
        .feedback-header { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 8px; font-size: 1.08rem; }
        .feedback-name { font-weight: bold; color: #1976d2; }
        .feedback-email { color: #388e3c; font-size: 0.98rem; }
        .feedback-rating { color: #ffb300; font-size: 1.2rem; margin-left: 8px; }
        .feedback-time { color: #888; font-size: 0.95rem; margin-left: auto; }
        .feedback-questions { margin-bottom: 8px; font-size: 1rem; }
        .feedback-comments { color: #333; font-size: 1.05rem; background: #e3f2fd; border-radius: 8px; padding: 8px 12px; margin-top: 8px; }
        @media (max-width: 900px) { .dashboard-card-full { padding: 0 2vw; } .dashboard-title { font-size: 1.5rem; } .dashboard-section { max-width: 98vw; } .leaderboard-table th, .leaderboard-table td { font-size: 1rem; padding: 6px 2px; } .feedback-entry { max-width: 98vw; font-size: 1rem; padding: 12px 2vw; } }
        @media (max-width: 600px) { .dashboard-title { font-size: 1.2rem; } .dashboard-section { max-width: 98vw; } .leaderboard-table th, .leaderboard-table td { font-size: 0.95rem; padding: 4px 1px; } .feedback-entry { max-width: 99vw; font-size: 0.95rem; padding: 8px 1vw; } .feedback-header { font-size: 0.95rem; gap: 6px; } }
        </style>
    `;
    dashboard.style.display = '';
    // Fetch leaderboard
    function fetchLeaderboard() {
        fetch(`/api/QuizHost/leaderboard/${quizId}`)
            .then(res => res.json())
            .then(data => {
                // Sort by score DESC, then time ASC, then difficulty DESC
                data.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    if (a.time !== b.time) return a.time.localeCompare(b.time);
                    if (b.difficulty !== a.difficulty) return b.difficulty.localeCompare(a.difficulty);
                    return 0;
                });
                const tbody = document.querySelector('#hostLeaderboardTable tbody');
                tbody.innerHTML = '';
                if (!Array.isArray(data) || data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7">No scores yet.</td></tr>';
                    return;
                }
                data.forEach((entry, idx) => {
                    // Badge logic
                    let badge = '';
                    if (idx === 0) badge = '<span class="badge-icon" title="Gold Medal">🥇</span>';
                    else if (idx === 1) badge = '<span class="badge-icon" title="Silver Medal">🥈</span>';
                    else if (idx === 2) badge = '<span class="badge-icon" title="Bronze Medal">🥉</span>';
                    else if (entry.score >= 90) badge = '<span class="badge-icon" title="Star Performer">⭐</span>';
                    else if (entry.score >= 75) badge = '<span class="badge-icon" title="Great Effort">🏅</span>';
                    else badge = '<span class="badge-icon" title="Participant">🎓</span>';
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${idx+1}</td><td>${entry.fullName || entry.email}</td><td>${entry.email}</td><td>${entry.score}</td><td>${entry.time || '-'}</td><td>${entry.difficulty || '-'}</td><td>${badge}</td>`;
                    tbody.appendChild(row);
                });
            });
    }
    fetchLeaderboard();
    window.hostLeaderboardInterval = setInterval(fetchLeaderboard, 5000);
    document.getElementById('closeQuizBtn').onclick = function() {
        fetch(`/api/QuizHost/close/${quizId}`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    clearInterval(window.hostLeaderboardInterval);
                    document.getElementById('closeQuizBtn').disabled = true;
                    document.getElementById('closeQuizBtn').innerText = 'Quiz Session Closed';
                    alert('Quiz session has been closed. No further participation allowed.');
                }
            });
    };
    // SignalR real-time updates for leaderboard and quiz closure
    let leaderboardConnection = null;
    function setupSignalR(quizId) {
        if (window.signalR && window.signalR.HubConnection) {
            leaderboardConnection = new window.signalR.HubConnectionBuilder()
                .withUrl(`/leaderboardHub?quizId=${quizId}`)
                .build();
            leaderboardConnection.on('LeaderboardUpdated', data => {
                // Sort and update leaderboard UI
                data.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    if (a.time !== b.time) return a.time.localeCompare(b.time);
                    if (b.difficulty !== a.difficulty) return b.difficulty.localeCompare(a.difficulty);
                    return 0;
                });
                const tbody = document.querySelector('#hostLeaderboardTable tbody');
                if (tbody) {
                    tbody.innerHTML = '';
                    data.forEach((entry, idx) => {
                        let badge = '';
                        if (idx === 0) badge = '<span class="badge-icon" title="Gold Medal">🥇</span>';
                        else if (idx === 1) badge = '<span class="badge-icon" title="Silver Medal">🥈</span>';
                        else if (idx === 2) badge = '<span class="badge-icon" title="Bronze Medal">🥉</span>';
                        else if (entry.score >= 90) badge = '<span class="badge-icon" title="Star Performer">⭐</span>';
                        else if (entry.score >= 75) badge = '<span class="badge-icon" title="Great Effort">🏅</span>';
                        else badge = '<span class="badge-icon" title="Participant">🎓</span>';
                        const row = document.createElement('tr');
                        row.innerHTML = `<td>${idx+1}</td><td>${entry.fullName || entry.email}</td><td>${entry.email}</td><td>${entry.score}</td><td>${entry.time || '-'}</td><td>${entry.difficulty || '-'}</td><td>${badge}</td>`;
                        tbody.appendChild(row);
                    });
                }
            });
            leaderboardConnection.on('QuizClosed', () => {
                const dashboard = document.getElementById('hostDashboardContainer');
                if (dashboard) {
                    dashboard.innerHTML += '<div style="color:red;font-size:1.2rem;">Quiz session has been closed by the host.</div>';
                }
                const closeBtn = document.getElementById('closeQuizBtn');
                if (closeBtn) {
                    closeBtn.disabled = true;
                    closeBtn.innerText = 'Quiz Session Closed';
                }
            });
            // Real-time feedback responses for host
            leaderboardConnection.on('FeedbackReceived', function(feedback) {
                const feedbackDashboard = document.getElementById('hostFeedbackDashboard');
                if (feedbackDashboard) {
                    const entry = document.createElement('div');
                    entry.className = 'feedback-entry';
                    entry.innerHTML = `
                        <div class="feedback-header">
                            <span class="feedback-name">${feedback.fullName}</span>
                            <span class="feedback-email">${feedback.email}</span>
                            <span class="feedback-rating">${'★'.repeat(feedback.starRating)}${'☆'.repeat(5-feedback.starRating)}</span>
                            <span class="feedback-time">${new Date(feedback.submittedAt).toLocaleString()}</span>
                        </div>
                        <div class="feedback-questions">
                            ${feedback.questions.map((q, i) => `<div><b>Q${i+1}:</b> ${q} <b>Ans:</b> ${feedback.responses[i]}</div>`).join('')}
                        </div>
                        <div class="feedback-comments">${feedback.comments}</div>
                    `;
                    feedbackDashboard.prepend(entry);
                }
            });
            leaderboardConnection.start();
        }
    }
    setupSignalR(quizId);
}

document.addEventListener("DOMContentLoaded", function() {
    // If host dashboard container exists, show dashboard
    const dashboard = document.getElementById('hostDashboardContainer');
    if (dashboard) {
        let quizId = '';
        const params = new URLSearchParams(window.location.search);
        quizId = params.get('quizId') || localStorage.getItem('quizId') || '';
        if (quizId) {
            showHostDashboard(quizId);
            // Show analytics if analytics container exists
            const analytics = document.getElementById('hostAnalyticsContainer');
            if (analytics) {
                showHostAnalytics(quizId);
            }
        } else {
            dashboard.innerHTML = '<div style="color:red;font-size:1.2rem;">Quiz ID not found. Cannot show dashboard.</div>';
        }
    }
});

// Host Analytics Dashboard
function showHostAnalytics(quizId) {
    const analytics = document.getElementById('hostAnalyticsContainer');
    analytics.innerHTML = `<div class="analytics-card-full">
        <h2 class="analytics-title">Quiz Analytics</h2>
        <div class="analytics-section" id="analyticsStats"></div>
        <div class="analytics-section" id="analyticsFeedback"></div>
        <style>
        .analytics-card-full { width: 100vw; min-height: 100vh; background: #f5f7fa; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 0; }
        .analytics-title { font-size: 2rem; color: #1976d2; font-weight: bold; margin: 32px 0 24px 0; text-align: center; }
        .analytics-section { margin-bottom: 32px; width: 100%; max-width: 600px; }
        @media (max-width: 900px) { .analytics-card-full { padding: 0 2vw; } .analytics-title { font-size: 1.5rem; } .analytics-section { max-width: 98vw; } }
        @media (max-width: 600px) { .analytics-title { font-size: 1.2rem; } .analytics-section { max-width: 98vw; } }
        </style>
    `;
    analytics.style.display = '';
    // Fetch stats
    fetch(`/api/QuizHost/analytics/${quizId}`)
        .then(res => res.json())
        .then(data => {
            const statsDiv = document.getElementById('analyticsStats');
            statsDiv.innerHTML = `<h3>Performance</h3>
                <div>Total Candidates: ${data.totalCandidates}</div>
                <div>Average Score: ${data.avgScore}</div>
                <div>Max Score: ${data.maxScore}</div>
                <div>Min Score: ${data.minScore}</div>`;
            const feedbackDiv = document.getElementById('analyticsFeedback');
            feedbackDiv.innerHTML = `<h3>Feedback Summary</h3>
                ${data.feedbackSummary.map((f, idx) => `<div>Q${idx+1}: Avg Rating: ${f.avgRating} (${f.count} responses)</div>`).join('')}`;
        });
}


