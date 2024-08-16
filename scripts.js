let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerId;
let timeLeft;
let username = '';

const startBtn = document.getElementById('start-btn');
const usernameInput = document.getElementById('username');

const categorySelect = document.getElementById('category-select');
const difficultySelect = document.getElementById('difficulty-select');
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

// usernameInput.addEventListener('input', function() {
//     this.value = this.value.toUpperCase();
// });


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



function loadScoreboard() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    scoreboard.innerHTML = '';
    endScoreboard.innerHTML = '';

    const scoreboardContent = document.createElement('div');
    scoreboardContent.classList.add('scoreboard-container');

    const title = document.createElement('div');
    title.classList.add('scoreboard-title');
    title.textContent = 'Top Scores';
    scoreboardContent.appendChild(title);

    if (scores.length === 0) {
        const noScoreItem = document.createElement('div');
        noScoreItem.classList.add('no-scores');
        noScoreItem.textContent = "No scores yet!";
        scoreboardContent.appendChild(noScoreItem);
    } else {
        scores.forEach(({ name, score }, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.classList.add('scoreboard-item');
            
            const rank = document.createElement('span');
            rank.classList.add('scoreboard-rank');
            rank.textContent = `${index + 1}.`;
            
            const username = document.createElement('span');
            username.classList.add('scoreboard-username');
            username.textContent = name.toUpperCase();
            
            const userScore = document.createElement('span');
            userScore.classList.add('scoreboard-score');
            userScore.textContent = score;
            
            scoreItem.appendChild(rank);
            scoreItem.appendChild(username);
            scoreItem.appendChild(userScore);
            
            scoreboardContent.appendChild(scoreItem);
        });
    }

    scoreboard.appendChild(scoreboardContent);
    endScoreboard.appendChild(scoreboardContent.cloneNode(true));
}

function clearAllScores() {
    localStorage.removeItem('scores');
    loadScoreboard();
    alert('Scoreboard has been cleared!');
}

async function startQuiz() {
    username = usernameInput.value.trim().toUpperCase();
    const category = categorySelect.value;
    const difficulty = difficultySelect.value;

    if (username === '') {
        alert('Please enter your name to start the quiz');
        return;
    }

    localStorage.setItem('username', username);
    startBtn.parentElement.classList.add('hide');
    displayContainer.classList.remove('hide');
    loadScoreboard();

    questions = await fetchQuestions(5, category, difficulty);
    if (questions.length > 0) {
        loadQuestion();
    } else {
        displayContainer.classList.add('hide');
        startBtn.parentElement.classList.remove('hide');
    }
}

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

function resetState() {
    clearInterval(timerId);
    while (optionsElement.firstChild) {
        optionsElement.removeChild(optionsElement.firstChild);
    }
    nextBtn.classList.add('hide');
    feedbackElement.classList.add('hide');
}

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
    
    feedbackElement.textContent = correct ? 'Correct!' : 'Wrong!';
    feedbackElement.classList.remove('hide');
    nextBtn.classList.remove('hide');
}

function loadNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    displayContainer.classList.add('hide');
    scoreContainer.classList.remove('hide');
    userScoreElement.textContent = `Your Score: ${score}`;

    saveScore();
    loadScoreboard();
}

function saveScore() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    const upperUsername = username.toUpperCase();
    
    // Check if the username already exists
    const existingScoreIndex = scores.findIndex(item => item.name.toUpperCase() === upperUsername);
    
    if (existingScoreIndex !== -1) {
        // If the username exists, update the score if the new score is higher
        if (score > scores[existingScoreIndex].score) {
            scores[existingScoreIndex].score = score;
        }
    } else {
        // If the username doesn't exist, add a new entry
        scores.push({ name: upperUsername, score });
    }
    
    // Sort scores in descending order
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only the top 5 scores
    const topScores = scores.slice(0, 5);
    
    localStorage.setItem('scores', JSON.stringify(topScores));
}

function saveProgress() {
    const progress = {
        currentQuestionIndex,
        score,
        questions
    };
    localStorage.setItem('quizProgress', JSON.stringify(progress));
}

function loadProgress() {
    const progress = JSON.parse(localStorage.getItem('quizProgress'));
    if (progress) {
        currentQuestionIndex = progress.currentQuestionIndex;
        score = progress.score;
        questions = progress.questions;
    }
}

function restartQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    questions = [];
    displayContainer.classList.add('hide');
    scoreContainer.classList.add('hide');
    startBtn.parentElement.classList.remove('hide');
    loadScoreboard();
}

document.addEventListener('DOMContentLoaded', loadScoreboard);