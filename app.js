require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser'); // обработка данных
const path = require('path'); // работа с путями файловой системы
const createError = require('http-errors');

const mainRouter = require("./routes/main");

const app = express();
const port = process.env.PORT || 3000; // по умолчанию порт 3000

// Настройка EJS как шаблонизатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Подключаем парсеры для обработки данных форм
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Настройка папки для статических файлов
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", mainRouter);

module.exports = app; // чтобы можно было импортировать этот файл


// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
