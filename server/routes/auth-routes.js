const express = require("express");

const { login, register } = require("../controller/auth-controller");

const router = express.Router();

router.route("/api/login").post(login);
router.route("/api/register").post(register);

module.exports = router;