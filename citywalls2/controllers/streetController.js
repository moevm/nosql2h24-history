const asyncHandler = require("express-async-handler");
const {importData} = require("../import");
const db = require("../db");


// Обработчики написаны с использованием express-async-handler, что позволяет управлять асинхронными операциями
// в функциях-обработчиках без явного использования блоков try/catch или обработки ошибок с помощью catch().
// Это упрощает обработку ошибок в асинхронных операциях.
//
// const {
//     // countAndListGenres,
//     // getBooksByGenre,
// } = require("./functions");

exports.main = asyncHandler(async (req, res) => {
    res.render('main', { title: 'Сервис истории домов Санкт-Петербурга' });
});

exports.index = asyncHandler(async (req, res) => {
    res.render('index');
});

exports.import = asyncHandler(async (req, res) => {
    await importData();
    res.send('Данные успешно импортированы.');
});

exports.streets = asyncHandler(async (req, res) => {
    console.log("Запрос на получение списка улиц...");
    const cursor = await db.query('FOR street IN streets RETURN street');
    const streets = await cursor.all();
    console.log("Улицы:", streets);
    res.render('streets', { streets });
});

exports.houses = asyncHandler(async (req, res) => {
    const streetKey = req.params.key;
    const streetId = `streets/${streetKey}`;
    console.log(`Запрос на получение домов для streetId: ${streetId}`);

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
});

// Маршрут для страницы фильтрации улиц
exports.streets_filter = asyncHandler(async (req, res) => {
    // Получаем список уникальных типов улиц и районов из базы
    const typesCursor = await db.query('FOR street IN streets RETURN DISTINCT street.type');
    const types = await typesCursor.all();
 
    const districtsCursor = await db.query('FOR street IN streets RETURN DISTINCT street.district');
    const districts = await districtsCursor.all();
 
    res.render('streets', {
        title: 'Улицы Санкт-Петербурга',
        types,
        districts
    });
});

// Маршрут для экспорта данных
exports.export = asyncHandler(async (req, res) => {
    // Получаем данные из коллекций
    const streetsCursor = await db.collection('streets').all();
    const housesCursor = await db.collection('houses').all();
    const locatedAtCursor = await db.collection('located_at').all();

    const streets = await streetsCursor.all();
    const houses = await housesCursor.all();
    const locatedAt = await locatedAtCursor.all();

    // Формируем объект для экспорта
    const exportData = {
        streets,
        houses,
        located_at: locatedAt,
    };

    // Указываем заголовки для скачивания файла
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="exported_data.json"');

    // Отправляем данные клиенту
    res.json(exportData);
});




// // Отображает страницу с подробной информацией о конкретном жанре на основе его идентификатора
// exports.genre_detail = asyncHandler(async (req, res, next) => {
//     // Get details of genre and all associated books (in parallel)
//     const [genre, booksInGenre] = [
//         getBooksByGenre(req.params.id)[0],
//         getBooksByGenre(req.params.id)[1],
//     ]
//     if (genre === null) {
//         // No results.
//         const err = new Error("Genre not found");
//         err.status = 404;
//         return next(err);
//     }
//
//     res.render("genre_detail", {
//         title: "Книги заданного жанра",
//         genre: genre,
//         genre_books: booksInGenre,
//     });
// });
