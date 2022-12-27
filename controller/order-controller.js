const Order = require("../models/order-model");

exports.createOrder = async (req, res) => {
    try {
        const { storeCreditDetails } = req.body;

        let order;
        let ObjectID = require("mongodb").ObjectID;
        let objectId = new ObjectID();

        if (storeCreditDetails) {
            order = await new Order({ _id: objectId, ...req.body }).save();
        } else {
            order = await new Order({ _id: objectId, userId: req.body.userId }).save();
        }
        res.status(200).json(order);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};