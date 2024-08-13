let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerId;
let timeLeft;
let username = '';

const startBtn = document.getElementById('start-btn');
const usernameInput = document.getElementById('username');
const displayContainer = document.getElementById('display-container');
const questionNumber = document.getElementById('question-number');
const timer = document.getElementById('timer');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const feedbackElement = document.getElementById('feedback');
const scoreContainer = document.querySelector('.score-container');
const userScoreElement = document.getElementById('user-score');
const restartBtn = document.getElementById('restart');
const scoreboard = document.getElementById('scoreboard');
const endScoreboard = document.getElementById('end-scoreboard');
const clearScoresBtn = document.getElementById('clear-scores-btn');

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', loadNextQuestion);
restartBtn.addEventListener('click', restartQuiz);
clearScoresBtn.addEventListener('click', clearAllScores);

// Fetching questions from Open Trivia Database API
async function fetchQuestions(amount = 5, category = '', difficulty = 'medium') {
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results.map(question => ({
            question: decodeURIComponent(question.question),
            options: [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5),
            answer: decodeURIComponent(question.correct_answer)
        }));
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to load questions. Please try again later.');
        return [];
    }
}

// Load the scoreboard from localStorage
function loadScoreboard() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    scoreboard.innerHTML = '';
    endScoreboard.innerHTML = '';

    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 5);

    if (topScores.length === 0) {
        const noScoreItem = document.createElement('div');
        noScoreItem.textContent = "No scores yet!";
        scoreboard.appendChild(noScoreItem);
        endScoreboard.appendChild(noScoreItem.cloneNode(true));
    } else {
        topScores.forEach(({ name, score }, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.classList.add('scoreboard-item');
            scoreItem.textContent = `${index + 1}. ${name}: ${score}`;
            scoreboard.appendChild(scoreItem);
            endScoreboard.appendChild(scoreItem.cloneNode(true));
        });
    }
}

// Clear the scoreboard data
function clearAllScores() {
    localStorage.removeItem('scores'); // Removes the scores from localStorage
    loadScoreboard(); // Reloade's the scoreboard to reflect the changes
    alert('Scoreboard has been cleared!');
}

// Starts the quiz
async function startQuiz() {
    username = usernameInput.value.trim();
    if (username === '') {
        alert('Please enter your name to start the quiz');
        return;
    }
    localStorage.setItem('username', username);
    startBtn.parentElement.classList.add('hide');
    displayContainer.classList.remove('hide');
    loadScoreboard();

    // Fetching questions from API
    questions = await fetchQuestions();
    if (questions.length > 0) {
        loadQuestion();
    } else {
        displayContainer.classList.add('hide');
        startBtn.parentElement.classList.remove('hide');
    }
}

// Loads a question
function loadQuestion() {
    resetState();
    startTimer(10);
    const currentQuestion = questions[currentQuestionIndex];
    questionNumber.textContent = `${currentQuestionIndex + 1} of ${questions.length} questions`;
    questionElement.textContent = currentQuestion.question;
    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-div');
        button.textContent = option;
        button.addEventListener('click', selectAnswer);
        optionsElement.appendChild(button);
    });
    saveProgress();
}

// Resets the state for the next question
function resetState() {
    clearInterval(timerId);
    while (optionsElement.firstChild) {
        optionsElement.removeChild(optionsElement.firstChild);
    }
    nextBtn.classList.add('hide');
    feedbackElement.classList.add('hide');
}

// Starts the timer for each question
function startTimer(seconds) {
    timeLeft = seconds;
    timer.textContent = `${timeLeft}s`;
    timerId = setInterval(() => {
        timeLeft--;
        timer.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerId);
            selectAnswer(null);
        }
    }, 1000);
}

// Handles answer selection
function selectAnswer(e) {
    clearInterval(timerId);
    const selectedBtn = e ? e.target : null;
    const correct = selectedBtn && selectedBtn.textContent === questions[currentQuestionIndex].answer;
    
    if (selectedBtn) {
        selectedBtn.classList.add(correct ? 'correct' : 'incorrect');
    }

    Array.from(optionsElement.children).forEach(button => {
        button.disabled = true;
        if (button.textContent === questions[currentQuestionIndex].answer) {
            button.classList.add('correct');
        }
    });

    if (correct) {
        score++;
    }
    
    feedbackElement.textContent = correct ? 'Correct!' : `The correct answer was ${questions[currentQuestionIndex].answer}`;
    feedbackElement.classList.remove('hide');
    nextBtn.classList.remove('hide');
    saveProgress();
}

// Loads the next question
function loadNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        displayScore();
    }
}

// Displays the final score
function displayScore() {
    displayContainer.classList.add('hide');
    startBtn.parentElement.classList.add('hide');
    scoreContainer.classList.remove('hide');
    userScoreElement.textContent = `Your Score: ${score}`;
    clearProgress();
    saveHighScore();
    loadScoreboard();
}

// Saves the high score to localStorage
function saveHighScore() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push({ name: username, score });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5);  
    localStorage.setItem('scores', JSON.stringify(scores));
    loadScoreboard();
}

// Saves the current progress in localStorage
function saveProgress() {
    localStorage.setItem('currentQuestionIndex', currentQuestionIndex);
    localStorage.setItem('score', score);
}

// Clears the current progress
function clearProgress() {
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('score');
}

// Restarts the quiz
function restartQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    scoreContainer.classList.add('hide');
    startBtn.parentElement.classList.remove('hide');
    clearProgress();
    loadScoreboard();
}
