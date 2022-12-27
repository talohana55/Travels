const mongoose = require("mongoose");

const airlineSchema = new mongoose.Schema(
    {
        cid: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        // originate in country
        country: {
            type: String,
            required: true,
        },
        symbol: {
            type: String,
        },
    }, { timestamps: true, cid: false }
);

const Airline = mongoose.model("airlines", airlineSchema, "airlines");
module.exports = Airline;
