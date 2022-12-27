const express = require("express");

const {
    getAllTravelRoutes, searchTravelRoute, createTravelRoute
} = require("../controller/travelRoute-controller");

const router = express.Router();

router.route("/api/travelRoutes/get").get(getAllTravelRoutes);
router.route("/api/travelRoutes/search").get(searchTravelRoute);
router.route("/api/travelRoutes/create").post(createTravelRoute);

module.exports = router;