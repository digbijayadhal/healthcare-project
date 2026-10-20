const chatBox = document.getElementById("chatBox");

function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.className = "message " + type;

    msg.innerHTML = `<div class="content">${text}</div>`;
    chatBox.appendChild(msg);

    chatBox.scrollTop = chatBox.scrollHeight;
}

function addDiseaseCard(disease) {
    const card = document.createElement("div");
    card.className = "ai-response-card";

    card.innerHTML = `
        <div class="card-header">
            ${disease.disease}
            <span class="severity-badge severity-${disease.severity.toLowerCase()}">
                ${disease.severity}
            </span>
        </div>
        <div class="card-body">
            <div class="card-section">
                <h4>Symptoms</h4>
                <p>${disease.symptoms.join(", ")}</p>
            </div>
            <div class="card-section">
                <h4>Medicine</h4>
                <p>${disease.medicine.join(", ")}</p>
            </div>
            <div class="card-section">
                <h4>First Aid</h4>
                <p>${disease.first_aid}</p>
            </div>
            <div class="card-section">
                <h4>Precaution</h4>
                <p>${disease.precaution}</p>
            </div>
        </div>
    `;

    chatBox.appendChild(card);
}

async function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value;

    if (!message) return;

    addMessage(message, "user-message");
    input.value = "";

    const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
    });

    const data = await response.json();

    addMessage(data.reply, "ai-message");

    data.data.forEach(disease => {
        addDiseaseCard(disease);
    });
}