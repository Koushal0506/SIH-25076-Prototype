// Main JavaScript for Krishi Sakha Platform
// Add these variables at the top
const API_BASE_URL = 'http://localhost:3000/api';
let chatSessionId = null;

// Update the sendChatbotMessage function
async function sendChatbotMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        input.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            // Get current language
            const languageSelect = document.getElementById('language-select');
            const language = languageSelect ? languageSelect.value : 'en';
            
            // Send message to backend
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    language: language,
                    sessionId: chatSessionId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store session ID for future requests
                if (data.sessionId && !chatSessionId) {
                    chatSessionId = data.sessionId;
                }
                
                removeTypingIndicator();
                addBotMessage(data.message);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            removeTypingIndicator();
            
            // Fallback response based on language
            const languageSelect = document.getElementById('language-select');
            const language = languageSelect ? languageSelect.value : 'en';
            
            const fallbackMessages = {
                'en': "I'm having trouble connecting to the server. Please check your connection and try again.",
                'hi': "मुझे सर्वर से कनेक्ट होने में समस्या हो रही है। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।",
                'ta': "சர்வருடன் இணைக்கும் போது பிரச்சனை ஏற்படுகிறது. தயவு செய்து உங்கள் இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
                'te': "నేను సర్వర్‌కి కనెక్ట్ అవ్వడంలో సమస్య ఎదుర్కొంటున్నాను. దయచేసి మీ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
                'bn': "আমি সার্ভারের সাথে সংযোগ করতে সমস্যা হচ্ছে। অনুগ্রহ করে আপনার সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
                'mr': "मला सर्व्हरशी कनेक्ट होताना त्रुटी येत आहे. कृपया आपले कनेक्शन तपासा आणि पुन्हा प्रयत्न करा."
            };
            
            addBotMessage(fallbackMessages[language] || fallbackMessages['en']);
        }
    }
}

// Add new function to clear chat history
async function clearChatHistory() {
    if (!chatSessionId) return;
    
    try {
        await fetch(`${API_BASE_URL}/chat/clear-history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: chatSessionId
            })
        });
        
        // Clear local chat messages
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="message bot-message">
                    <div class="message-content">
                        <p>${getLanguageChangeMessage()}</p>
                    </div>
                </div>
            `;
        }
        
        // Reset session ID
        chatSessionId = null;
        
    } catch (error) {
        console.error('Error clearing chat history:', error);
    }
}

// Add clear chat button to chatbot header (update HTML)
// Add this to your chatbot header in index.html:
// <button class="chatbot-clear" id="chatbot-clear" title="Clear chat">🗑️</button>

// Add this CSS for the clear button

// Add event listener for clear button in initChatbot()
const chatbotClear = document.getElementById('chatbot-clear');
if (chatbotClear) {
    chatbotClear.addEventListener('click', clearChatHistory);
}

// Initialize the platform
document.addEventListener('DOMContentLoaded', function() {
    console.log('Krishi Sakha platform loaded');
    
    // Initialize modals
    initModals();
    
    // Initialize event listeners
    initEventListeners();
    
    // Check for user authentication
    checkAuthStatus();
    
    // Load initial data
    loadInitialData();
});

// Initialize modals
function initModals() {
    // Get modals
    const loginModal = document.getElementById('login-modal');
    const voiceModal = document.getElementById('voice-modal');
    
    // Get buttons that open modals
    const loginBtn = document.getElementById('login-btn');
    const voiceBtn = document.getElementById('voice-support-btn');
    const callDemoBtn = document.getElementById('call-demo-btn');
    
    // Get close buttons
    const closeBtns = document.querySelectorAll('.close');
    const endCallBtn = document.getElementById('end-call');
    
    // Open login modal
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'block';
        });
    }
    
    // Open voice support modal
    if (voiceBtn) {
        voiceBtn.addEventListener('click', function() {
            voiceModal.style.display = 'block';
            simulateVoiceCall();
        });
    }
    
    // Open voice demo modal
    if (callDemoBtn) {
        callDemoBtn.addEventListener('click', function() {
            voiceModal.style.display = 'block';
            simulateVoiceCall();
        });
    }
    
    // Close modals
    closeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            loginModal.style.display = 'none';
            voiceModal.style.display = 'none';
        });
    });
    
    // End call button
    if (endCallBtn) {
        endCallBtn.addEventListener('click', function() {
            voiceModal.style.display = 'none';
            showFeedbackForm();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target == voiceModal) {
            voiceModal.style.display = 'none';
        }
    });
    
    // Option buttons in voice call
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const option = this.getAttribute('data-option');
            handleVoiceOption(option);
        });
    });
}

// Initialize event listeners
function initEventListeners() {
    // Google login
    const googleLoginBtn = document.getElementById('google-login');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // Navigation smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Form submission
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginForm);
    }
}

// Check authentication status
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('krishi_sakha_logged_in');
    const loginBtn = document.getElementById('login-btn');
    
    if (isLoggedIn === 'true' && loginBtn) {
        loginBtn.textContent = 'Logout';
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Load initial data
function loadInitialData() {
    // In a real application, this would fetch data from APIs
    console.log('Loading initial data...');
}

// Handle Google login
function handleGoogleLogin() {
    console.log('Initiating Google login...');
    
    // Simulate Google OAuth process
    showLoading('Connecting to Google...');
    
    setTimeout(function() {
        hideLoading();
        
        // Simulate successful login
        localStorage.setItem('krishi_sakha_logged_in', 'true');
        localStorage.setItem('krishi_sakha_user', JSON.stringify({
            name: 'Demo Farmer',
            email: 'demo@krishisakha.com',
            phone: '+91 XXXXX XXXXX'
        }));
        
        // Close modal and update UI
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('login-btn').textContent = 'Logout';
        
        alert('Successfully logged in with Google!');
    }, 1500);
}

// Handle login form submission
function handleLoginForm(e) {
    e.preventDefault();
    
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.trim();
    
    if (!isValidPhone(phone)) {
        alert('Please enter a valid phone number');
        return;
    }
    
    showLoading('Sending OTP...');
    
    // Simulate OTP sending
    setTimeout(function() {
        hideLoading();
        alert(`OTP has been sent to ${phone}. In a real application, you would enter the OTP to verify.`);
        document.getElementById('login-modal').style.display = 'none';
    }, 1500);
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('krishi_sakha_logged_in');
    localStorage.removeItem('krishi_sakha_user');
    document.getElementById('login-btn').textContent = 'Login';
    alert('Successfully logged out!');
}

// Validate phone number
function isValidPhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
}

// Show loading indicator
function showLoading(message) {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById('loading-overlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(255,255,255,0.8)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.zIndex = '2000';
        
        const loadingContent = document.createElement('div');
        loadingContent.style.textAlign = 'center';
        
        const spinner = document.createElement('div');
        spinner.style.border = '4px solid #f3f3f3';
        spinner.style.borderTop = '4px solid #138808';
        spinner.style.borderRadius = '50%';
        spinner.style.width = '40px';
        spinner.style.height = '40px';
        spinner.style.animation = 'spin 1s linear infinite';
        spinner.style.margin = '0 auto 15px';
        
        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        messageEl.style.color = '#000080';
        
        loadingContent.appendChild(spinner);
        loadingContent.appendChild(messageEl);
        loadingOverlay.appendChild(loadingContent);
        
        document.body.appendChild(loadingOverlay);
        
        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    } else {
        loadingOverlay.style.display = 'flex';
    }
}

// Hide loading indicator
function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Simulate voice call
function simulateVoiceCall() {
    const callStatusText = document.getElementById('call-status-text');
    const callOptions = document.querySelector('.call-options');
    
    // Hide options initially
    callOptions.style.display = 'none';
    
    // Simulate call connection process
    let count = 0;
    const statusMessages = [
        'Connecting...',
        'Routing to AI advisor...',
        'Almost connected...',
        'Connected!'
    ];
    
    const connectionInterval = setInterval(function() {
        if (count < statusMessages.length) {
            callStatusText.textContent = statusMessages[count];
            count++;
        } else {
            clearInterval(connectionInterval);
            callStatusText.textContent = 'Connected to AI advisor';
            
            // Show options after connection
            callOptions.style.display = 'block';
        }
    }, 1000);
}

// Handle voice option selection
function handleVoiceOption(option) {
    const responses = {
        'pest': 'For pest control, I recommend using neem-based organic pesticides. Would you like more specific advice for your crop?',
        'weather': 'The weather forecast for your region shows mild temperatures with a chance of rain in the next 3 days. Perfect for sowing season!',
        'crop': 'Based on your soil type and season, I recommend considering soybean cultivation which has good market demand this year.',
        'market': 'Current market prices for wheat are ₹2,100 per quintal. Tomato prices are at ₹1,800 per quintal. Shall I connect you with buyers?'
    };
    
    const response = responses[option] || 'I understand your query. Let me connect you with an agricultural expert for more specific advice.';
    
    // Update call UI with response
    const callOptions = document.querySelector('.call-options');
    callOptions.innerHTML = `
        <div class="ai-response">
            <h4>AI Advisor Response:</h4>
            <p>${response}</p>
            <div class="response-actions">
                <button class="option-btn" id="another-question">Ask Another Question</button>
                <button class="btn-end-call" id="end-call-now">End Call</button>
            </div>
        </div>
    `;
    
    // Add event listeners to new buttons
    document.getElementById('another-question').addEventListener('click', function() {
        // Reset to options
        document.querySelector('.call-options').innerHTML = `
            <h4>What do you need help with?</h4>
            <div class="option-buttons">
                <button class="option-btn" data-option="pest">Pest Control</button>
                <button class="option-btn" data-option="weather">Weather</button>
                <button class="option-btn" data-option="crop">Crop Advice</button>
                <button class="option-btn" data-option="market">Market Prices</button>
            </div>
        `;
        
        // Reattach event listeners
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const option = this.getAttribute('data-option');
                handleVoiceOption(option);
            });
        });
    });
    
    document.getElementById('end-call-now').addEventListener('click', function() {
        document.getElementById('voice-modal').style.display = 'none';
        showFeedbackForm();
    });
}

// Show feedback form after call
function showFeedbackForm() {
    const feedbackHtml = `
        <div class="feedback-container">
            <h3>How was your experience with our AI advisor?</h3>
            <div class="rating">
                <span class="star" data-rating="1">★</span>
                <span class="star" data-rating="2">★</span>
                <span class="star" data-rating="3">★</span>
                <span class="star" data-rating="4">★</span>
                <span class="star" data-rating="5">★</span>
            </div>
            <textarea placeholder="Additional feedback (optional)" rows="3"></textarea>
            <button class="btn-primary" id="submit-feedback">Submit Feedback</button>
        </div>
    `;
    
    // Create feedback modal
    const feedbackModal = document.createElement('div');
    feedbackModal.id = 'feedback-modal';
    feedbackModal.className = 'modal';
    feedbackModal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            ${feedbackHtml}
        </div>
    `;
    
    document.body.appendChild(feedbackModal);
    
    // Show modal
    feedbackModal.style.display = 'block';
    
    // Add event listeners
    feedbackModal.querySelector('.close').addEventListener('click', function() {
        feedbackModal.style.display = 'none';
        document.body.removeChild(feedbackModal);
    });
    
    // Star rating functionality
    const stars = feedbackModal.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            setRating(stars, rating);
        });
    });
    
    // Submit feedback
    feedbackModal.querySelector('#submit-feedback').addEventListener('click', function() {
        alert('Thank you for your feedback!');
        feedbackModal.style.display = 'none';
        document.body.removeChild(feedbackModal);
    });
    
    // Close when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target == feedbackModal) {
            feedbackModal.style.display = 'none';
            document.body.removeChild(feedbackModal);
        }
    });
}

// Set star rating
function setRating(stars, rating) {
    stars.forEach(star => {
        if (star.getAttribute('data-rating') <= rating) {
            star.style.color = '#FF9933'; // Saffron color
        } else {
            star.style.color = '#ccc';
        }
    });
}