require('dotenv').config();
const { Database } = require('arangojs');
const fs = require('fs');
const path = require('path');

async function importData() {
  const dbName = process.env.ARANGO_DB || 'city_data';

  // Создаем экземпляр sysDb для работы с системной базой данных
  const sysDb = new Database({
    url: process.env.ARANGO_URL || 'http://localhost:8529',
    auth: {
      username: process.env.ARANGO_USER || 'root',
      password: process.env.ARANGO_PASSWORD || 'password'
    }
  });

  const maxRetries = 10;
  let retries = 0;

  // Ожидание запуска ArangoDB
  while (retries < maxRetries) {
    try {
      await sysDb.version();
      console.log('Подключение к ArangoDB установлено.');
      break;
    } catch (err) {
      retries++;
      console.log(`ArangoDB не готов, повторная попытка (${retries}/${maxRetries})...`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  if (retries === maxRetries) {
    console.error('Не удалось подключиться к ArangoDB после нескольких попыток.');
    throw new Error('Не удалось подключиться к ArangoDB.');
  }

  try {
    // Проверяем и создаем базу данных, если необходимо
    const databases = await sysDb.listDatabases();

    if (!databases.includes(dbName)) {
      await sysDb.createDatabase(dbName);
      console.log(`База данных '${dbName}' создана.`);
    } else {
      console.log(`База данных '${dbName}' уже существует.`);
    }

    // Создаем экземпляр db для работы с нужной базой данных
    const db = new Database({
      url: process.env.ARANGO_URL || 'http://localhost:8529',
      databaseName: dbName,
      auth: {
        username: process.env.ARANGO_USER || 'root',
        password: process.env.ARANGO_PASSWORD || 'password'
      }
    });

    // Создаем или получаем коллекции
    const streetsCollection = db.collection('streets');
    if (!await streetsCollection.exists()) {
      await streetsCollection.create();
      console.log("Коллекция 'streets' создана.");
    } else {
      console.log("Коллекция 'streets' уже существует.");
    }

    const housesCollection = db.collection('houses');
    if (!await housesCollection.exists()) {
      await housesCollection.create();
      console.log("Коллекция 'houses' создана.");
    } else {
      console.log("Коллекция 'houses' уже существует.");
    }

    const locatedAtCollection = db.collection('located_at');
    if (!await locatedAtCollection.exists()) {
      await locatedAtCollection.create({ type: 'edge' });
      console.log("Реберная коллекция 'located_at' создана.");
    } else {
      console.log("Реберная коллекция 'located_at' уже существует.");
    }

    // Импортируем данные
    const streetsDataPath = path.join(__dirname, 'data', 'streets.json');
    const housesDataPath = path.join(__dirname, 'data', 'houses.json');
    const locatedAtDataPath = path.join(__dirname, 'data', 'located_at.json');

    const streetsData = JSON.parse(fs.readFileSync(streetsDataPath, 'utf8'));
    const housesData = JSON.parse(fs.readFileSync(housesDataPath, 'utf8'));
    const locatedAtData = JSON.parse(fs.readFileSync(locatedAtDataPath, 'utf8'));

    // Логирование данных перед импортом
    console.log('Данные для импортирования:');
    console.log('Streets:', streetsData);
    console.log('Houses:', housesData);
    console.log('Located_at:', locatedAtData);

    // Проверка наличия _from и _to в реберных документах
    const invalidEdges = locatedAtData.filter(edge => !edge._from || !edge._to);
    if (invalidEdges.length > 0) {
      console.error('Некоторые документы в located_at не содержат полей _from и/или _to:', invalidEdges);
      throw new Error('Некоторые документы в located_at не содержат полей _from и/или _to.');
    }

    // Очищаем коллекции перед импортом (опционально)
    await streetsCollection.truncate();
    await housesCollection.truncate();
    await locatedAtCollection.truncate();

    // Импортируем документы
    await streetsCollection.import(streetsData);
    await housesCollection.import(housesData);
    await locatedAtCollection.import(locatedAtData);

    console.log('Данные успешно импортированы.');
  } catch (err) {
    console.error('Ошибка при импорте данных:', err);
    throw err;
  }
}

module.exports = { importData };