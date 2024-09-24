const express = require('express');
const { Database } = require('arangojs');

const app = express();
const port = 3000;

const db = new Database({
  url: 'http://arango:8529', // Имя сервиса в docker-compose
  auth: { username: 'root', password: 'password' }
});

// Маршрут для проверки наличия коллекции и вывода "Hello World"
app.get('/', async (req, res) => {
  try {
    await db.version();

    const collectionName = 'citywalls';

    const collection = db.collection(collectionName);

    const exists = await collection.exists();

    if (exists) {
      res.send('Hello World');
    } else {
      res.status(404).send(`Коллекция "${collectionName}" не найдена.`);
    }

  } catch (err) {
    console.error('Ошибка подключения к базе данных:', err);
    res.status(500).send('Не удалось подключиться к базе данных.');
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
