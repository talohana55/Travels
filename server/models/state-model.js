const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
    {
        cid: {
            type: String,
            required: true,
            unique: true
        },
        cityName: {
            type: String,
            required: true
        },
        // originate in country
        state: {
            type: String,
            required: true
        },
        flag: {
            type: String,
            required: true
        },
    }, { timestamps: true, cid: false }
);

const State = mongoose.model("states", stateSchema, "states");
module.exports = State;
