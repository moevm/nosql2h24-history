const express = require("express");
const router = express.Router();

const street_controller = require("../controllers/streetController");

// Главная страница
router.get('/', street_controller.index)

router.get('/main', street_controller.main)

router.post('/import',  street_controller.import)

// Маршрут для экспорта данных
router.get('/export', street_controller.export)

// Маршрут для страницы фильтрации улиц
router.get('/main/streets', street_controller.streets_filter)

router.get('/main/streets/filter', street_controller.streets)

// router.get('/streets/:key/houses', street_controller.houses)


module.exports = router;




