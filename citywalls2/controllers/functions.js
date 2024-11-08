// const fs = require('fs');
//
// const path = require('path');
//
// // Получаем полный путь к файлу library.json
// const filePath = path.join(__dirname, 'library.json');
//
//
// // Чтение данных из JSON-файла
// const rawData = fs.readFileSync(filePath, 'utf-8');
// const library = JSON.parse(rawData);
//
// // 1) Количество книг и список книг
// function countAndListBooks() {
//     const count = library.length;
//     const bookList = library.map(book => book.title);
//     return [count, bookList];
// }
//
//
//
// module.exports = {
//     countAndListBooks,
// };