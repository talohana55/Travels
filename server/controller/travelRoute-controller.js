const TravelRoute = require('../models/travelRoute-model');

exports.getAllTravelRoutes = async (req, res) => {
    try {
        const routes = await TravelRoute.find({});
        if (routes.length) {
            res.status(200).json(routes);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.searchTravelRoute = async (req, res) => {
    try {
        const { from, to } = req.body;
        const routes = await Flight.findOne({ from, to });

        if (routes.length) {
            res.status(200).json(routes);
        }
        else {
            res.status(200).json([]);
        }

    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

exports.createTravelRoute= async (req, res) => {
    try {
        var ObjectID = require("mongodb").ObjectID;
        var objectId = new ObjectID();
        const newRoute = new TravelRoute({ cid: objectId, ...req.body });
        await newRoute.save();
        res.status(200).json(newRoute);

    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}
