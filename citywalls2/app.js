require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser'); // обработка данных
const { Database } = require('arangojs');
const path = require('path'); // работа с путями файловой системы
const { importData } = require('./import');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const mainRouter = require("./routes/main");

const app = express();
const port = process.env.PORT || 3000; // по умолчанию порт 3000

// Создаем экземпляр базы данных с указанием databaseName
const db = new Database({
  url: process.env.ARANGO_URL || 'http://arango:8529',
  databaseName: process.env.ARANGO_DB || 'city_data',
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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/main", mainRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app; // чтобы можно было импортировать этот файл








// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
