const express = require("express");

const {
    getUsers
} = require("../controller/user-controller");

const router = express.Router();

router
    .route("/api/users")
    .get(getUsers);

module.exports = router;