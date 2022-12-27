const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        cardNumber: {
            type: Number,
            required: false,
        },
        cardExpirationMonth: {
            type: String,
            required: false,
        },
        cardExpirationYear: {
            type: String,
            required: false,
        },
        cardCvv: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("orders", orderSchema, "orders");
module.exports = Order;
