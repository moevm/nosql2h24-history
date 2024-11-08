const express = require("express");
const router = express.Router();

const street_controller = require("../controllers/streetController");

// Главная страница
router.get('/', street_controller.index)

router.post('/import',  street_controller.import)

router.get('/streets',  street_controller.streets)

router.get('/streets/:key/houses', street_controller.houses)


module.exports = router;




