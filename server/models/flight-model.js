const mongoose = require("mongoose");

const flightsSchema = new mongoose.Schema(
    {
        cid: {
            type: String,
            required: true,
            unique: true,
        },
        flight_num: {
            type: String,
            required: true,
        },
        departure: {
            type: String,
            required: true,
        },
        destination: {
            type: String,
            required: true,
        },
        carrier_id: {
            type: String,
            required: true,
        },
        departure_datetime: {
            type: Date,
            required: true,
        },
        arrival_datetime: {
            type: Date,
            required: false,
        },
        airline_type: {
            type: String,
            required: true,
        },
        max_capacity: {
            type: Number,
            required: true,
        },
        current_capacity: {
            type: Number,
            required: true,
        },
        price_per_ticket: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true, cid: false }
);

const Flight = mongoose.model('flights', flightsSchema, 'flights');
module.exports = Flight;