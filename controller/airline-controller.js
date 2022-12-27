const Airline = require("../models/airline-model");

exports.getAirlines = async (req, res) => {
    try {
        const airlines = await Airline.find();
        if (airlines.length) {
            res.status(200).json(airlines);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.getAirlineById = async (req, res) => {
    try {
        const { id } = req.body;
        const airline = await Airline.findOne({ cid: id });
        if (airline) {
            res.status(200).json(airline);
        } else {
            res.status(200).json();
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.createAirline = async (req, res) => {
    try {
        var ObjectID = require("mongodb").ObjectID;
        var objectId = new ObjectID();
        const airline = new Airline({ cid: objectId, ...req.body });
        await airline.save();
        res.status(200).json(airline);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};