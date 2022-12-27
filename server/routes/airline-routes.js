const express = require("express");

const {
    getAirlines,
    getAirlineById,
    createAirline,
} = require("../controller/airline-controller");

const router = express.Router();

router.route("/api/airlines/get").get(getAirlines);
router.route("/api/airlines/get/id").get(getAirlineById);
router.route("/api/airlines/create").post(createAirline);

module.exports = router;