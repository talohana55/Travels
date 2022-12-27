const express = require("express");

const {
    getAllFlights,
    getFlightById,
    createFlight,
    updateFlight,
    searchFlight,
    removeFlight,
} = require("../controller/flight-controller");

const router = express.Router();

router.route("/api/flights/get").get(getAllFlights);
router.route("/api/flights/get/:cid").get(getFlightById);
router.route("/api/flights/search").get(searchFlight);
router.route("/api/flights/create").post(createFlight);
router.route("/api/flights/update").put(updateFlight);
router.route("/api/flights/delete").delete(removeFlight);

module.exports = router;