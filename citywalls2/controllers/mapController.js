// const asyncHandler = require("express-async-handler");
//
// // Обработчики написаны с использованием express-async-handler, что позволяет управлять асинхронными операциями
// // в функциях-обработчиках без явного использования блоков try/catch или обработки ошибок с помощью catch().
// // Это упрощает обработку ошибок в асинхронных операциях.
//
// const {
//     countAndListAuthors,
//     getBooksByAuthor
// } = require("./functions");
// const {getBooksByGenre} = require("./functions");
//
// // отображает список всех авторов.
// exports.author_list = asyncHandler(async (req, res, next) => {
//     const allAuthors = countAndListAuthors()[1]
//     res.render("author_list", {
//         title: "Список авторов",
//         author_list: allAuthors,
//     });
// });
//
// exports.author_detail = asyncHandler(async (req, res, next) => {
//     const [author, allBooksByAuthor] = [
//         getBooksByAuthor(req.params.id)[0],
//         getBooksByAuthor(req.params.id)[1],
//     ]
//
//     if (author === null) {
//         const err = new Error("Author not found");
//         err.status = 404;
//         return next(err);
//     }
//
//     res.render("author_detail", {
//         title: "Список книг данного автора",
//         author: author,
//         author_books: allBooksByAuthor,
//     });
// });

