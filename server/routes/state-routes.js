const express = require("express");

const {
    getStates,
    getStateById,
    createState
} = require("../controller/state-controller");

const router = express.Router();

router.route("/api/states/get").get(getStates);
router.route("/api/states/search/id").get(getStateById);
router.route("/api/states/create").post(createState);

module.exports = router;