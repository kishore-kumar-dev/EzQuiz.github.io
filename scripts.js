const questions = [
    {
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
        answer: "Hyper Text Markup Language"
    },
    {
        question: "Which tag is used to define an unordered list in HTML?",
        options: ["<ol>", "<ul>", "<li>", "<list>"],
        answer: "<ul>"
    },
    {
        question: "What is the correct HTML element for inserting a line break?",
        options: ["<br>", "<lb>", "<break>", "<newline>"],
        answer: "<br>"
    },
    {
        question: "Which attribute is used to provide an alternate text for an image?",
        options: ["src", "alt", "title", "description"],
        answer: "alt"
    },
    {
        question: "Which HTML tag is used to define an internal style sheet?",
        options: ["<css>", "<script>", "<style>", "<stylesheet>"],
        answer: "<style>"
    }
];

let currentQuestionIndex = parseInt(localStorage.getItem('currentQuestionIndex')) || 0;
let score = parseInt(localStorage.getItem('score')) || 0;
let timerId;
let timeLeft;

const startBtn = document.getElementById('start-btn');
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
const highScoreElement = document.getElementById('high-score');

startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', loadNextQuestion);
restartBtn.addEventListener('click', restartQuiz);

function startQuiz() {
    startBtn.parentElement.classList.add('hide');
    displayContainer.classList.remove('hide');
    loadHighScore();
    loadQuestion();
}

function loadQuestion() {
    resetState();
    startTimer(10);
    let currentQuestion = questions[currentQuestionIndex];
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
    
    feedbackElement.textContent = correct ? 'Correct!' : 'The correct answer was ' + questions[currentQuestionIndex].answer;
    feedbackElement.classList.remove('hide');
    nextBtn.classList.remove('hide');
    saveProgress();
}

function loadNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        displayScore();
    }
}

function displayScore() {
    displayContainer.classList.add('hide');
    scoreContainer.classList.remove('hide');
    userScoreElement.textContent = `Your Score: ${score}`;
    saveHighScore();
    clearProgress();
}

function saveHighScore() {
    let highScore = parseInt(localStorage.getItem('highScore')) || 0;
    if (score > highScore) {
        localStorage.setItem('highScore', score);
        highScoreElement.textContent = `High Score: ${score} (New High Score!)`;
    } else {
        highScoreElement.textContent = `High Score: ${highScore}`;
    }
}

function loadHighScore() {
    let highScore = parseInt(localStorage.getItem('highScore')) || 0;
    highScoreElement.textContent = `High Score: ${highScore}`;
}

function saveProgress() {
    localStorage.setItem('currentQuestionIndex', currentQuestionIndex);
    localStorage.setItem('score', score);
}

function clearProgress() {
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('score');
}

function restartQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    scoreContainer.classList.add('hide');
    startBtn.parentElement.classList.remove('hide');
    clearProgress();
}
