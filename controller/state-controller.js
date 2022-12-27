const State = require("../models/state-model");

exports.getStates = async (req, res) => {
    try {
        const states = await State.find();
        if (states.length) {
            res.status(200).json(states);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.getStateById = async (req, res) => {
    try {
        const { id } = req.body;
        const states = await State.findOne({ cid: id });
        if (states) {
            res.status(200).json(airline);
        } else {
            res.status(200).json();
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.createState = async (req, res) => {
    try {
        var ObjectID = require("mongodb").ObjectID;
        var objectId = new ObjectID();
        const state = new State({ cid: objectId, ...req.body });
        await state.save();
        res.status(200).json(state);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};