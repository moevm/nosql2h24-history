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

// Маршрут для страницы фильтрации улиц
exports.streets_filter = asyncHandler(async (req, res) => {
    // Получаем список уникальных типов улиц и районов из базы
    const typesCursor = await db.query('FOR street IN streets RETURN DISTINCT street.type');
    const types = await typesCursor.all();
 
    const districtsCursor = await db.query('FOR street IN streets RETURN DISTINCT street.district');
    const districts = await districtsCursor.all();
 
    res.render('streets_filter', {
        title: 'Улицы Санкт-Петербурга',
        types,
        districts
    });
});

exports.streets = asyncHandler( async (req, res) => {
    const { type, district } = req.query;

    // Строим запрос с учётом фильтров
    let query = 'FOR street IN streets';
    const bindVars = {};

    if (type) {
        query += ' FILTER street.type == @type';
        bindVars.type = type;
    }

    if (district) {
        query += ' FILTER street.district == @district';
        bindVars.district = district;
    }

    // Добавляем сортировку
    query += ' SORT street.name ASC RETURN street';

    // Выполняем запрос
    const streetsCursor = await db.query(query, bindVars);
    const streets = await streetsCursor.all();

    // Отправляем отфильтрованные данные на фронтенд
    res.render('streets', { title: 'Улицы Санкт-Петербурга (результат фильтрации)', streets });
});

exports.housesByStreet = asyncHandler(async (req, res) => {
    const streetName = req.params.streetName; // Получаем имя улицы из URL

    // Запрашиваем данные улицы, чтобы получить её тип
    const streetQuery = `
            FOR street IN streets
                FILTER street.name == @streetName
                RETURN street
        `;
    const streetCursor = await db.query(streetQuery, { streetName });
    const streetData = await streetCursor.next();

    if (!streetData) {
        return res.status(404).send('Улица не найдена.');
    }

    // Запрашиваем дома, относящиеся к указанной улице
    const housesQuery = `
            FOR house IN houses
                FILTER house.street == @streetName
                SORT house.house_number ASC
                RETURN house
        `;
    const housesCursor = await db.query(housesQuery, { streetName });
    const houses = await housesCursor.all();

    res.render('houses', {
        title: `${streetData.name} (${streetData.type}). Количество найденных домов: ${houses.length}`,
        houses,
    });

});

exports.houseDetails = asyncHandler(async (req, res) => {
    const houseId = req.params.houseId; // ID дома из URL

    // Запрашиваем данные дома по его ID
    const query = `
        FOR house IN houses
            FILTER house._key == @houseId
            RETURN house
    `;
    const houseCursor = await db.query(query, { houseId });
    const house = await houseCursor.next();

    if (!house) {
        return res.status(404).send('Дом не найден.');
    }

    res.render('house', {
        title: `Страница дома: ${house.street}, ${house.house_number}`,
        house,
    });

});

exports.filterPage = asyncHandler(async (req, res) => {
    const districtsCursor = await db.query('FOR house IN houses RETURN DISTINCT house.district');
    const districts = await districtsCursor.all();

    const managementCompaniesCursor = await db.query('FOR house IN houses RETURN DISTINCT house.management_company');
    const managementCompanies = await managementCompaniesCursor.all();

    const conditionsCursor = await db.query('FOR house IN houses RETURN DISTINCT house.condition');
    const conditions = await conditionsCursor.all();

    res.render('houses_filter', {
        title: 'Дома Санкт-Петербурга',
        districts,
        managementCompanies,
        conditions,
    });
});
 
exports.filteredHouses = asyncHandler(async (req, res) => {
    const { year, district, floors, apartments, condition, management_company, street } = req.query;
 
    let query = 'FOR house IN houses';
    const bindVars = {};
 
    if (year) {
        const [minYear, maxYear] = year.split('-').map(Number);
        query += ' FILTER house.construction_year >= @minYear AND house.construction_year <= @maxYear';
        bindVars.minYear = minYear;
        bindVars.maxYear = maxYear;
    }
 
    if (district) {
        query += ' FILTER house.district == @district';
        bindVars.district = district;
    }
 
    if (floors) {
        query += ' FILTER house.floors == @floors';
        bindVars.floors = Number(floors);
    }
 
    if (apartments) {
        query += ' FILTER house.apartments == @apartments';
        bindVars.apartments = Number(apartments);
    }
 
    if (condition) {
        query += ' FILTER house.condition == @condition';
        bindVars.condition = condition;
    }
 
    if (management_company) {
        query += ' FILTER house.management_company == @management_company';
        bindVars.management_company = management_company;
    }
 
    if (street) {
        query += ' FILTER house.street == @street';
        bindVars.street = street;
    }
 
    query += ' RETURN house';
 
    const cursor = await db.query(query, bindVars);
    const houses = await cursor.all();
 
    res.render('houses_list', {
        title: 'Результаты фильтрации домов',
        houses,
    });
});

