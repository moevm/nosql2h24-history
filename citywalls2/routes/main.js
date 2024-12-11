const express = require("express");
const router = express.Router();

const street_controller = require("../controllers/streetController");

// Главная страница
router.get('/', street_controller.index)

router.get('/main', street_controller.main)

router.post('/import',  street_controller.import)

// Маршрут для экспорта данных
router.get('/export', street_controller.export)

router.get('/main/streets', street_controller.streets)

// Маршрут для отображения домов конкретной улицы
router.get('/main/streets/:streetName/houses', street_controller.housesByStreet);

// Маршрут для страницы дома
router.get('/main/streets/:streetName/houses/:houseId', street_controller.houseDetails);

router.get('/main/houses', street_controller.filterPage);
router.get('/main/houses/filter', street_controller.filteredHouses);

module.exports = router;




