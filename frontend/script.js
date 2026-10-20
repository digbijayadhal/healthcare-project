document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const loadingOverlay = document.getElementById("loading");

    // ✅ Backend endpoint (correct)
    const BACKEND_URL = "http://127.0.0.1:5000/api/chat";

    function appendMessage(sender, text, data = null) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        
        let avatarIcon = "";
        if (sender === "user") {
            messageDiv.classList.add("user-message");
            avatarIcon = '<i class="fa-solid fa-user"></i>';
        } else {
            messageDiv.classList.add("ai-message");
            avatarIcon = '<i class="fa-solid fa-robot"></i>';
        }

        let contentHTML = <div class="avatar">${avatarIcon}</div><div class="content"><p>${text}</p>;

        if (data && data.matched_disease) {
            const disease = data.matched_disease;
            const severityClass = disease.severity ? severity-${disease.severity.toLowerCase()} : '';
            
            contentHTML += `
                <div class="ai-response-card">
                    <div class="card-header">
                        <span>${disease.disease}</span>
                        ${disease.severity ? <span class="severity-badge ${severityClass}">${disease.severity}</span> : ''}
                    </div>
                    <div class="card-body">
                        <div class="card-section">
                            <h4>Matched Symptoms</h4>
                            <p>${data.symptoms_identified.join(", ") || 'None matched'}</p>
                        </div>
                        <div class="card-section">
                            <h4>Medicines</h4>
                            <ul>${(disease.medicine || []).map(m => <li>${m}</li>).join('')}</ul>
                        </div>
                        <div class="card-section">
                            <h4>First Aid</h4>
                            <p>${disease.first_aid || ''}</p>
                        </div>
                        <div class="card-section">
                            <h4>Home Remedies</h4>
                            <p>${disease.home_remedy || ''}</p>
                        </div>
                        <div class="card-section">
                            <h4>Precautions</h4>
                            <p>${disease.precaution || ''}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        contentHTML += </div>;
        messageDiv.innerHTML = contentHTML;
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function sendMessage() {
        const textAreaValue = userInput.value.trim();
        if (!textAreaValue) return;

        appendMessage("user", textAreaValue);
        userInput.value = "";

        loadingOverlay.style.display = "flex";

        try {
            console.log("Calling backend:", BACKEND_URL);

            const response = await fetch(BACKEND_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: textAreaValue })
            });

            const responseData = await response.json();
            loadingOverlay.style.display = "none";

            if (!response.ok) {
                appendMessage("ai", responseData.error || "Server error occurred.");
                return;
            }

            if (responseData.matched_disease) {
                appendMessage(
                    "ai",
                    "Based on your symptoms, here is the closest match:",
                    responseData
                );
            } else {
                appendMessage(
                    "ai",
                    responseData.message || "No matching disease found."
                );
            }

        } catch (error) {
            console.error("Fetch Error:", error);
            loadingOverlay.style.display = "none";
            appendMessage(
                "ai",
                "❌ Cannot connect to backend. Make sure Flask is running on port 5000."
            );
        }
    }

    sendBtn.addEventListener("click", sendMessage);

    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
});