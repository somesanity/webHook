const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

const SECRET = 'my-super-secret-token-12345'; // Тот же секрет, что в настройках Webhook

// Middleware для проверки подписи
function verifyGitHubSignature(req, res, next) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        return res.status(401).send('No signature provided');
    }

    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (signature !== digest) {
        return res.status(401).send('Invalid signature');
    }
    next();
}

// Обработчик Webhook
app.post('/webhook', verifyGitHubSignature, (req, res) => {
    const event = req.headers['x-github-event'];

    if (event === 'push') {
        console.log('Получен push от GitHub, запускаю сборку...');
        // Команда для обновления репозитория и сборки
        exec('cd /home/admin/webHook && git pull && npm install && npm run build && sudo systemctl reload nginx', (err, stdout, stderr) => {
            if (err) {
                console.error('Ошибка сборки:', err);
                return res.status(500).send('Build failed');
            }
            console.log('Сборка завершена:', stdout);
            res.status(200).send('Build successful');
        });
    } else {
        res.status(200).send('Event ignored');
    }
});

// Запуск сервера
app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});