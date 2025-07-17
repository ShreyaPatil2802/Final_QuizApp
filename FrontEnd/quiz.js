let questions = [];
let currentIndex = 0;
let score = 0;

const currentCategory = new URLSearchParams(window.location.search).get('category');

function loadQuestions(category) {
    fetch(`https://localhost:7291/api/Questions/random?category=${encodeURIComponent(category)}&count=10`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to load questions.");
            return response.json();
        })
        .then(data => {
            questions = data;
            currentIndex = 0;
            score = 0;
            showQuestion();
        })
        .catch(error => {
            document.getElementById('question-text').innerText = error.message;
        });
}

function showQuestion() {
    const q = questions[currentIndex];
    document.getElementById('question-text').innerText = `Q${currentIndex + 1}: ${q.text}`;
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    document.getElementById('feedback').innerText = '';

    // ✅ Update progress bar
    document.getElementById('progress-bar').style.width = `${((currentIndex + 1) / questions.length) * 100}%`;

    const options = q.options || [];
    options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = `${String.fromCharCode(65 + i)}: ${opt}`;
        btn.onclick = () => handleAnswer(opt, q.correctOption);
        optionsContainer.appendChild(btn);
    });
}

function handleAnswer(selected, correct) {
    const feedback = document.getElementById('feedback');
    if (selected === correct) {
        feedback.innerText = "✅ Correct!";
        feedback.className = "feedback correct";
        score++;
    } else {
        feedback.innerText = `❌ Incorrect! Correct answer: ${correct}`;
        feedback.className = "feedback incorrect";
    }

    setTimeout(() => {
        currentIndex++;
        if (currentIndex < questions.length) {
            showQuestion();
        } else {
            const username = localStorage.getItem("username");

            if (!username) {
                alert("User not logged in. Redirecting to login.");
                window.location.href = "login.html";
                return;
            }

            localStorage.setItem("quizScore", score);

            fetch('https://localhost:7291/api/quiz/submit-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, score })
            })
                .then(async res => {
                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(errorText || "Failed to submit score");
                    }

                    const message = await res.text();
                    console.log("✅", message);
                    window.location.href = "result.html";
                })
                .catch(err => {
                    console.error("❌ Error submitting score:", err);
                    alert("Could not submit score. Please try again.");
                });
        }
    }, 1500);
}

loadQuestions(currentCategory);





