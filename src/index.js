const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const { writeData } = require('./workers/write-json');

const jsonParser = express.json();
const urlencodedParser = bodyParser.urlencoded({extended: false})

const { secret_key, admin } = require('../server-config');

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.post('/login', urlencodedParser, function(req, res) {
  // Проверяем пользователя (логин и пароль)
  if (req.body.username == admin.name && req.body.password == admin.password) {

    // Создаем payload для токена
    const payload = { 
      username: admin.name,
      role: admin.role
    };

    // Опции токена
    const tokenOptions = {
      expiresIn: 900 // Время жизни токена (seconds)
    };

    // Создаем новый токен
    const token = jwt.sign({ payload }, secret_key, tokenOptions); 

    // Отправляем токен пользователю
    res.json({
      token: token
    })
  } else {
    res.sendStatus(401);
  }
})

app.post('/admin/set', jsonParser, ensureToken, (req, res) => {
  jwt.verify(req.token, secret_key, function(err, data){
    if (err) {
      res.sendStatus(403);
    } else {
      writeData(req.body, function() {
        res.json(req.body);
      });
    }
  });
});

function ensureToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

app.get('/api/rolls/', (req, res) => {
  fs.readFile('./src/storage/sushi.json', 'utf-8', (err, data) => {
    if(err) {
      console.log('ошибка ссука');
      throw err
    }
    res.send(data);
  })
});

const port = 8000;
app.listen(port, () => {
  console.log(`Сервер запущен на: http://localhost:${port}`);
});