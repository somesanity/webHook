const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const app = express();
app.use(express.json())
app.use(cors());

const SECRET_TOKEN = 'my-super-secret-token-12345'; // Тот же токен, что в GitHub Secrets

app.use('/', express.static(path.join(__dirname, 'build'))); // Раздача статических файлов из папки build

app.post('/webhook', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${SECRET_TOKEN}`) {
      return res.status(403).send('Unauthorized');
    }
  
    console.log('Webhook received:', req.body);
  
    // Выполняем скрипт деплоя
    exec('./deploy.sh', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).send('Deployment failed');
      }
      console.log(`Output: ${stdout}`);
      console.error(`Errors: ${stderr}`);
      res.status(200).send('Deployment started');
    });
  });

app.listen(2000, (error) => {
    const PORT = 2000
    if(error) {
      return console.log(error)
    }

    return console.log(`http://localhost:${PORT}`)
})