import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("GROQ_API_KEY не найден");
} else {
  console.log("GROQ_API_KEY успешно загружен");
}

async function askGroq(message: string) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY не найден");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
Ты — AI Booking Assistant.

Ты помогаешь гостю с заселением в отель.

У тебя есть два возможных статуса паспорта:

1. Паспорт не получен.
2. Паспорт получен.

Правила:

- Если паспорт НЕ получен и гость спрашивает о заселении или дальнейших действиях, объясни, что сначала необходимо предоставить паспорт.
- В этом случае обязательно предоставь тестовую ссылку:
https://example.com/passport

- Если паспорт ПОЛУЧЕН, сообщи, что паспорт принят, и объясни, что следующим этапом будет оплата залога.

- Отвечай вежливо, кратко и понятно.
- Не выдумывай дополнительные данные об отеле.
- Учитывай одновременно сообщение гостя и текущий статус паспорта.
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.2,
      }),
    }
  );

  const data = await response.json();

  console.log("Groq HTTP status:", response.status);
  console.log("Groq response:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Ошибка при обращении к Groq"
    );
  }

  return data.choices?.[0]?.message?.content || "Модель не вернула ответ";
}

app.post("/api/chat", async (req, res) => {
  try {
    const { passportReceived, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Сообщение гостя не может быть пустым",
      });
    }

    const prompt = `
Текущий статус паспорта:
${passportReceived ? "Паспорт получен" : "Паспорт не получен"}

Сообщение гостя:
${message}
`;

    const response = await askGroq(prompt);

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("Ошибка /api/chat:", error);

    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не удалось получить ответ от языковой модели",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
