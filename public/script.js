window.addEventListener('DOMContentLoaded', () => {
    // Show animated character
    document.getElementById('welcomeAnimated').classList.add('show');

    // Show chat modal on click
    document.getElementById('welcomeAnimated').addEventListener('click', () => {
        const chatModal = document.getElementById('chatModal');
        chatModal.style.display = 'flex';
        loadChatQuestions();
    });

    // Close chat modal
    document.getElementById('closeChatBtn').addEventListener('click', () => {
        document.getElementById('chatModal').style.display = 'none';
    });

    // Gallery scroll (if exists)
    const track = document.getElementById('galleryTrack');
    if (track) {
        // Optional: Add arrow buttons or swipe for gallery if you want
    }

    // Booking form backend submission (NEW: see below)
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const data = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                checkin_date: document.getElementById('checkin_date').value,
                checkout_date: document.getElementById('checkout_date').value,
                room_type: document.getElementById('room_type').value,
                guests: parseInt(document.getElementById('guests').value)
            };

            fetch('https://chill-olaroyalluxuryhomes.onrender.com/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(response => {
                    if (response.message === 'Booking saved!') {
                        window.location.href = "confirmed.html";
                    } else {
                        alert('Booking failed: ' + response.message);
                    }
                })
                .catch(error => {
                    alert('Could not connect to server. Please try again later.');
                    console.error(error);
                });
        });
    }

    // Availability calendar feedback
    const dateInput = document.getElementById('availabilityDate');
    const feedbackDiv = document.getElementById('calendarFeedback');
    if (dateInput) {
        dateInput.addEventListener('change', function () {
            feedbackDiv.style.opacity = 0;
            setTimeout(() => {
                feedbackDiv.textContent = "No bookings for this day yet!";
                feedbackDiv.style.opacity = 1;
            }, 200);
        });
    }
});

// ---- OUTSIDE DOMContentLoaded ----

// For gallery horizontal scroll (add arrow buttons in your HTML to use this)
function scrollGallery(direction) {
    const track = document.getElementById('galleryTrack');
    if (track) {
        const scrollAmount = 250;
        track.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }
}

// ---- Chatbot Q&A ----
const chatbotQA = [
    {
        question: "What dates are available?",
        answer: "You can check available dates by clicking the 'Book Now' button or contacting us directly. For fastest response, WhatsApp or call +2347077979710."
    },
    {
        question: "How do I make a booking?",
        answer: "To book, click the 'Book Now' button or use our Contact page. We'll respond within 1 hour."
    },
    {
        question: "What amenities are included?",
        answer: "All rooms come with AC, Wi-Fi, DSTV, a fully-equipped kitchen, 24/7 support, and much more. Check our amenities list below!"
    },
    {
        question: "Can I request airport pickup?",
        answer: "Yes! We offer airport pick-up for guests on request. Please contact us after booking to arrange."
    },
    {
        question: "How do I contact you?",
        answer: "Visit the Contact page, or call/WhatsApp us at +2347077979710."
    }
    // Add more as needed
];

// Show chatbot questions
function loadChatQuestions() {
    const chatBody = document.getElementById('chatBody');
    chatBody.innerHTML = '<div style="margin-bottom:8px;">What would you like to ask?</div>';
    chatbotQA.forEach((item, idx) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'chat-question';
        qDiv.textContent = item.question;
        qDiv.onclick = () => showAnswer(idx);
        chatBody.appendChild(qDiv);
    });
}

// Show chatbot answer
function showAnswer(idx) {
    const chatBody = document.getElementById('chatBody');
    chatBody.innerHTML = `
        <div class="chat-question" style="background:#ffe4ee; cursor:default; margin-bottom: 4px;">${chatbotQA[idx].question}</div>
        <div class="chat-answer">${chatbotQA[idx].answer}</div>
        <button id="backToQuestions" style="background:#8b001b;color:#fff;border:none;padding:7px 18px;border-radius:8px;cursor:pointer;">Back</button>
    `;
    document.getElementById('backToQuestions').onclick = loadChatQuestions;
}
