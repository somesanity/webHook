const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = 2000;
const SECRET = "my-super-secret-token-12345"; // Убедитесь, что совпадает с GitHub

app.use(express.static(path.join(__dirname, 'build'))); // Раздача статических файлов из папки build

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Middleware для получения raw body и парсинга JSON
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf; // Сохраняем необработанное тело
    }
}));

// Обработчик Webhook
app.post("/webhook", (req, res) => {
    // Проверяем, что тело запроса получено
    if (!req.rawBody) {
        return res.status(400).send("No raw body received");
    }

    // Вычисляем подпись
    const signature = `sha256=${crypto
        .createHmac("sha256", SECRET)
        .update(req.rawBody)
        .digest("hex")}`;

    const githubSignature = req.headers["x-hub-signature-256"];

    console.log("Computed signature:", signature);
    console.log("GitHub signature:", githubSignature);
    console.log("Request body:", req.body);

    // Проверяем подпись
    if (!githubSignature || signature !== githubSignature) {
        return res.status(401).send("Invalid signature");
    }

    console.log("Received event:", req.body);
    res.status(200).send("Webhook received");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});