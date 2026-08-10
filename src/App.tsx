import { useState } from "react";
import "./App.css";

function App() {
  const [passportReceived, setPassportReceived] = useState(false);
  const [guestMessage, setGuestMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGetAiResponse = async () => {
    if (!guestMessage.trim()) {
      return;
    }

    setIsLoading(true);
    setAiResponse("");

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          passportReceived,
          message: guestMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка сервера");
      }

      setAiResponse(data.response);
    } catch (error) {
      console.error("Ошибка при запросе:", error);

      setAiResponse(
        error instanceof Error
          ? error.message
          : "Не удалось получить ответ."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app">
      <div className="booking-card">
        <h1>AI Booking Assistant</h1>

        <section className="section">
          <h2>Статус паспорта</h2>

          <div className="passport-status">
            <label>
              <input
                type="radio"
                name="passport"
                checked={!passportReceived}
                onChange={() => setPassportReceived(false)}
              />
              Паспорт не получен
            </label>

            <label>
              <input
                type="radio"
                name="passport"
                checked={passportReceived}
                onChange={() => setPassportReceived(true)}
              />
              Паспорт получен
            </label>
          </div>
        </section>

        <section className="section">
          <label htmlFor="guest-message">
            <h2>Сообщение гостя</h2>
          </label>

          <textarea
            id="guest-message"
            value={guestMessage}
            onChange={(event) => setGuestMessage(event.target.value)}
            placeholder="Напишите сообщение гостя..."
            rows={5}
          />
        </section>

        <button
          className="ai-button"
          disabled={!guestMessage.trim() || isLoading}
          onClick={handleGetAiResponse}
        >
          {isLoading ? "ИИ формирует ответ..." : "Получить ответ ИИ"}
        </button>

        <section className="section">
          <h2>Ответ ИИ</h2>

          <div className="ai-response">
            {aiResponse || "Здесь появится ответ языковой модели"}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
