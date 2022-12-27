const Ticket = require("../models/ticket-model")
//const moment = require('moment');

exports.generateTicketForFlight = async (req, res) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "123456789";

    var result = "";
    for (var i = 0; i < 3; i++)
        result += nums[Math.floor(Math.random() * nums.length)];
    for (var i = 0; i < 3; i++)
        result += chars[Math.floor(Math.random() * chars.length)];

    const checkResult = await Ticket.find({ booking_ref: result });
    return checkResult.length ? await generateTicketForFlight() : result;
}
exports.getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find();
        if (tickets.length) {
            res.status(200).json(tickets);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.body;
        const tickets = await Ticket.findOne({ cid: id });
        if (tickets) {
            res.status(200).json(tickets);
        } else {
            res.status(200).json();
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.createTicket = async (req, res) => {
    try {
        var ObjectID = require("mongodb").ObjectID;
        var objectId = new ObjectID();
        const ticket = new Ticket({ cid: objectId, ...req.body });
        await ticket.save();
        res.status(200).json(ticket);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};