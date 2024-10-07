require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Database } = require('arangojs');
const path = require('path');
const { importData } = require('./import');

const app = express();
const port = process.env.PORT || 3000;

// Создаем экземпляр базы данных с указанием databaseName
const db = new Database({
  url: process.env.ARANGO_URL || 'http://arango:8529',
  databaseName: process.env.ARANGO_DB || '_system',
  auth: {
    username: process.env.ARANGO_USER || 'root',
    password: process.env.ARANGO_PASSWORD || 'password'
  }
});

// Настройка EJS как шаблонизатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Подключаем парсеры для обработки данных форм
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Настройка папки для статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для главной страницы
app.get('/', (req, res) => {
  res.render('index');
});

// Маршрут для запуска импорта данных
app.post('/import', async (req, res) => {
  try {
    await importData();
    res.send('Данные успешно импортированы.');
  } catch (err) {
    console.error('Ошибка при импорте данных:', err);
    res.status(500).send('Ошибка при импорте данных.');
  }
});

// Маршрут для получения списка улиц
app.get('/streets', async (req, res) => {
  try {
    // Используем AQL-запрос для получения всех улиц
    const cursor = await db.query('FOR street IN streets RETURN street');
    const streets = await cursor.all();
    res.render('streets', { streets });
  } catch (err) {
    console.error('Ошибка получения улиц:', err);
    res.status(500).send('Не удалось получить список улиц.');
  }
});

app.get('/streets/:key/houses', async (req, res) => {
  const streetKey = req.params.key;
  const streetId = `streets/${streetKey}`;
  console.log(`Запрос на получение домов для streetId: ${streetId}`);

  try {
    const query = `
      FOR house IN houses
        FILTER house._id IN (
          FOR edge IN located_at
            FILTER edge._to == @streetId
            RETURN edge._from
        )
      RETURN house
    `;
    const bindVars = { streetId };
    const cursor = await db.query(query, bindVars);
    const houses = await cursor.all();
    console.log(`Найдено домов: ${houses.length}`);
    console.log('Дома:', houses);
    res.render('houses', { houses, streetKey });
  } catch (err) {
    console.error('Ошибка получения домов:', err);
    res.status(500).send('Не удалось получить список домов.');
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
