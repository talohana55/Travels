const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    cid: {
        type: String,
        required: true,
        unique: true
    },
    booking_ref: {
        type: Number,
        required: true
    },
    flight_num: {
        type: String,
        required: true
    },
    departure: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    seat_num: {
        type: String,
        require: true
    },
    carrier: {
        type: String,
        require: true
    },
    departure_time: {
        type: Date,
        require: true
    },
    return_date: {
        type: Date,
        require: true
    },
    baggage: {
        type: String
    }


}, { timestamps: true });

const Ticket = mongoose.model('tickets', ticketSchema, 'tickets');
module.exports = Ticket;