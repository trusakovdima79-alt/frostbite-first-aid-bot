// Загрузка базы знаний
let medicalData;
fetch('medical-data.json')
    .then(response => response.json())
    .then(data => {
        medicalData = data;
        // Показываем начальные кнопки действий
        showQuickActions(['Как определить степень обморожения?', 'Что делать при обморожении?', 'Когда вызывать скорую?']);
    })
    .catch(error => console.error('Ошибка загрузки данных:', error));

// Элементы DOM
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const quickActions = document.getElementById('quickActions');

// Отправка сообщения
sendButton.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
});

function handleUserMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    userInput.value = '';
    
    // Проверка на экстренные симптомы
    if (medicalData && checkEmergency(message)) {
        addMessage(
            '🚨  <strong>ВНИМАНИЕ!</strong> Судя по симптомам, ситуация может быть серьёзной. ' +
            'Немедленно звоните <strong>112</strong>. До приезда скорой: укутайте пострадавшего в тёплое одеяло, ' +
            'дайте тёплое (не горячее) питьё, если он в сознании.',
            'bot'
        );
        return;
    }
    
    // Поиск подходящего ответа
    const response = findBestResponse(message);
    setTimeout(() => addMessage(response, 'bot'), 500);
}

function handleQuickAction(text) {
    addMessage(text, 'user');
    const response = findBestResponse(text);
    setTimeout(() => addMessage(response, 'bot'), 500);
}

function findBestResponse(message) {
    const msg = message.toLowerCase();
    
    // Проверяем совпадения с паттернами в базе
    for (const question of medicalData.questions) {
        for (const pattern of question.patterns) {
            if (msg.includes(pattern)) {
                return question.response;
            }
        }
    }
    
    // Если нет точного совпадения — случайный общий ответ
    const defaults = medicalData.default_responses;
    return defaults[Math.floor(Math.random() * defaults.length)];
}

function checkEmergency(message) {
    const msg = message.toLowerCase();
    return medicalData.emergency_phrases.some(phrase => msg.includes(phrase));
}

function showQuickActions(actions) {
    quickActions.innerHTML = '';
    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'quick-action-btn';
        btn.textContent = action;
        btn.addEventListener('click', () => handleQuickAction(action));
        quickActions.appendChild(btn);
    });
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
