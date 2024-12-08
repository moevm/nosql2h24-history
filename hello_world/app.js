const express = require('express');
const { Database } = require('arangojs');
const app = express();
const port = 3000;
const db = new Database({
  url: 'http://arango:8529', // то имя сервиса в docker-compose
  auth: { username: 'root', password: 'password' }
});
// Маршрут для проверки базы данных и вывода "Hello World"
app.get('/', async (req, res) => {
  try {
    await db.version();
    res.send('Hello World');
  } catch (err) {
    console.error('Ошибка подключения к базе данных:', err);
    res.status(500).send('Не удалось подключиться к базе данных');
  }
});
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
