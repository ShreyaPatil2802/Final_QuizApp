
function loadQuestions(category) {
    console.log("Fetching questions for:", category);

    fetch(`https://localhost:7291/api/Questions/category/${encodeURIComponent(category)}`)
        .then(response => {
            if (!response.ok) throw new Error("No questions found.");
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('questions-container');
            container.innerHTML = '';

            data.forEach((q, index) => {
                const options = q.options || []; // fallback to empty array
                const questionHTML = `
                    <div class="question">
                        <h3>Q${index + 1}: ${q.text}</h3>
                        <ul>
                            ${options.map((opt, i) => `<li>${String.fromCharCode(65 + i)}: ${opt}</li>`).join('')}
                        </ul>
                    </div>
                `;
                container.innerHTML += questionHTML;
            });
        })
        .catch(error => {
            console.error("Error loading questions:", error);
            document.getElementById('questions-container').innerHTML = `<p>${error.message}</p>`;
        });
}
