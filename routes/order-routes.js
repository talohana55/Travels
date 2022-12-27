const express = require("express");

const {
    createOrder,
} = require("../controller/order-controller");

const router = express.Router();

router.route("/api/orders/create").post(createOrder);

module.exports = router;