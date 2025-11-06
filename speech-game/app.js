/*
 * Speech Game App - Enhanced Version
 * Author: Sharifi Heravi
 * Copyright (c) 2025 Sharifi Heravi. All Rights Reserved.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- عناصر DOM ---
    const screens = {
        levelSelection: document.getElementById('level-selection-screen'),
        game: document.getElementById('game-screen'),
        wordManager: document.getElementById('word-manager-screen')
    };
    const levelBtns = document.querySelectorAll('.level-btn');
    const startBtn = document.getElementById('start-btn');
    const backToLevelsBtn = document.getElementById('back-to-levels-btn');
    const manageWordsBtn = document.getElementById('manage-words-btn');
    const backFromManagerBtn = document.getElementById('back-to-levels-from-manager');
    const aboutBtnMain = document.getElementById('about-btn-main');
    const aboutModal = document.getElementById('about-modal');
    const closeModalBtn = document.getElementById('close-modal');

    // عناصر بازی
    const wordDisplay = document.getElementById('word-display');
    const feedback = document.getElementById('feedback');
    const typedWordsContainer = document.getElementById('typed-words');
    const scoreEl = document.getElementById('score');
    const levelEl = document.getElementById('level');
    const encouragementEffect = document.getElementById('encouragement-effect');

    // عناصر مدیریت کلمات
    const managerLevelSelect = document.getElementById('manager-level-select');
    const wordListEl = document.getElementById('word-list');
    const newWordInput = document.getElementById('new-word-input');
    const addWordBtn = document.getElementById('add-word-btn');

    // --- متغیرهای حالت بازی ---
    let recognition;
    let isListening = false;
    let currentWord = '';
    let score = 0;
    let level = 1;
    let streak = 0;
    let wordsSpokenInLevel = 0;
    const WORDS_PER_LEVEL = 5; // این می‌تواند تغییر کند یا حذف شود

    // --- کلمات پیش‌فرض ---
    const defaultWords = {
        1: ['سلام', 'خوب', 'آب', 'نام', 'سام', 'راد', 'باران'],
        2: ['کامپیوتر', 'برنامه', 'تکنولوژی', 'آینده', 'هوشمند'],
        3: ['سوسک', 'زرافه', 'مسابقه', 'استراتژی', 'پایداری']
    };

    // --- توابع مدیریت صفحات ---
    const showScreen = (screenName) => {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenName].classList.add('active');
    };

    // --- توابع مدیریت کلمات (localStorage) ---
    const getWords = () => {
        const storedWords = localStorage.getItem('speechGameWords');
        return storedWords ? JSON.parse(storedWords) : defaultWords;
    };

    const saveWords = (words) => {
        localStorage.setItem('speechGameWords', JSON.stringify(words));
    };

    const renderWordList = () => {
        const words = getWords();
        const selectedLevel = managerLevelSelect.value;
        const levelWords = words[selectedLevel] || [];
        
        wordListEl.innerHTML = '';
        if (levelWords.length === 0) {
            wordListEl.innerHTML = '<p>هیچ کلمه‌ای برای این سطح وجود ندارد.</p>';
            return;
        }
        levelWords.forEach(word => {
            const item = document.createElement('div');
            item.className = 'word-item';
            item.innerHTML = `<span>${word}</span><button data-word="${word}">حذف</button>`;
            wordListEl.appendChild(item);
        });
    };

    // --- منطق اصلی بازی ---
    const initSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('مرورگر شما از تشخیص صدا پشتیبانی نمی‌کند. لطفاً از آخرین نسخه Chrome استفاده کنید.');
            return;
        }
        recognition = new SpeechRecognition();
        recognition.lang = 'fa-IR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListening = true;
            startBtn.textContent = 'در حال گوش دادن...';
            startBtn.disabled = true;
            feedback.textContent = 'حالا بگو!';
            feedback.className = '';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            checkWord(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            feedback.textContent = 'خطا! دوباره تلاش کن.';
            feedback.className = 'incorrect';
            stopListening();
        };

        recognition.onend = () => {
            stopListening();
        };
    };

    const startGame = () => {
        score = 0;
        streak = 0;
        wordsSpokenInLevel = 0;
        updateUI();
        typedWordsContainer.innerHTML = '';
        nextWord();
        recognition.start();
    };

    const stopListening = () => {
        isListening = false;
        if (recognition) recognition.stop();
        startBtn.textContent = 'ادامه تمرین';
        startBtn.disabled = false;
    };

    const nextWord = () => {
        const words = getWords();
        const levelWords = words[level] || [];
        if (levelWords.length === 0) {
            feedback.textContent = `هیچ کلمه‌ای برای سطح ${level} وجود ندارد. لطفاً از بخش مدیریت کلمات، کلمه اضافه کنید.`;
            feedback.className = 'incorrect';
            stopListening();
            return;
        }
        currentWord = levelWords[Math.floor(Math.random() * levelWords.length)];
        wordDisplay.textContent = currentWord;
        feedback.textContent = '';
        feedback.className = '';
    };

    const checkWord = (spokenWord) => {
        if (spokenWord.toLowerCase() === currentWord.toLowerCase()) {
            // صحیح
            streak++;
            score += 10 * streak;
            feedback.textContent = `عالی! (+${10 * streak})`;
            feedback.className = 'correct';
            addTypedWord(currentWord);
            triggerEncouragementEffect();
            
            // رفتن به کلمه بعدی پس از مدت کوتاه
            setTimeout(nextWord, 1000); 

        } else {
            // غلط
            streak = 0;
            feedback.textContent = `اشتباه گفتی: "${spokenWord}"`;
            feedback.className = 'incorrect';
        }
        updateUI();
    };

    const triggerEncouragementEffect = () => {
        encouragementEffect.classList.add('active');
        setTimeout(() => {
            encouragementEffect.classList.remove('active');
        }, 500);
    };

    const addTypedWord = (word) => {
        const span = document.createElement('span');
        span.className = 'typed-word';
        span.textContent = word;
        typedWordsContainer.appendChild(span);
    };

    const updateUI = () => {
        scoreEl.textContent = score;
        levelEl.textContent = level;
    };

    // --- رویدادها ---
    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            level = parseInt(btn.dataset.level);
            updateUI();
            showScreen('game');
        });
    });

    startBtn.addEventListener('click', () => {
        if (isListening) {
            stopListening();
        } else {
            if (!recognition) initSpeechRecognition();
            if (startBtn.textContent === 'شروع تمرین') {
                startGame();
            } else {
                recognition.start();
            }
        }
    });

    backToLevelsBtn.addEventListener('click', () => {
        stopListening();
        showScreen('levelSelection');
    });

    manageWordsBtn.addEventListener('click', () => {
        showScreen('wordManager');
        renderWordList();
    });

    backFromManagerBtn.addEventListener('click', () => {
        showScreen('levelSelection');
    });

    managerLevelSelect.addEventListener('change', renderWordList);

    addWordBtn.addEventListener('click', () => {
        const newWord = newWordInput.value.trim();
        if (!newWord) {
            alert('لطفاً یک کلمه وارد کنید.');
            return;
        }
        const words = getWords();
        const selectedLevel = managerLevelSelect.value;
        if (!words[selectedLevel]) words[selectedLevel] = [];
        
        if (words[selectedLevel].includes(newWord)) {
            alert('این کلمه از قبل وجود دارد.');
            return;
        }

        words[selectedLevel].push(newWord);
        saveWords(words);
        newWordInput.value = '';
        renderWordList();
    });

    wordListEl.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const wordToDelete = e.target.dataset.word;
            const words = getWords();
            const selectedLevel = managerLevelSelect.value;
            
            words[selectedLevel] = words[selectedLevel].filter(w => w !== wordToDelete);
            saveWords(words);
            renderWordList();
        }
    });

    aboutBtnMain.addEventListener('click', () => aboutModal.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => aboutModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === aboutModal) aboutModal.style.display = 'none'; });

    // --- شروع ---
    initSpeechRecognition();
});