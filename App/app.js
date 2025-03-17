const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 2000;
const SECRET = "my-super-secret-token-12345";

app.use(express.static(path.join(__dirname, "build")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use(
    bodyParser.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        },
    })
);

app.post("/webhook", (req, res) => {
    if (!req.rawBody) {
        return res.status(400).send("No raw body received");
    }

    const signature = `sha256=${crypto
        .createHmac("sha256", SECRET)
        .update(req.rawBody)
        .digest("hex")}`;
    const githubSignature = req.headers["x-hub-signature-256"];

    console.log("Computed signature:", signature);
    console.log("GitHub signature:", githubSignature);
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);

    if (!githubSignature || signature !== githubSignature) {
        return res.status(401).send("Invalid signature");
    }

    console.log("Received event:", req.body);

    // Отправляем ответ сразу, чтобы избежать тайм-аута
    res.status(202).send("Deployment process started");

    // Выполняем скрипт деплоя асинхронно
    exec('/home/admin/cd/CI-CD/App/deploy.sh', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing deploy.sh: ${error.message}`);
            console.error(`Full stderr: ${stderr}`);
            return; // Не отправляем ответ, так как он уже отправлен
        }
        console.log(`Deployment output: ${stdout}`);
        if (stderr) console.error(`Deployment warnings: ${stderr}`);
    });
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err.stack);
    process.exit(1);
});