const Flight = require("../models/flight-model");
const moment = require("moment");

exports.getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.find({});
        if (flights.length) {
            res.status(200).json(flights);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.getFlightById = async (req, res) => {
    try {
        const { cid } = req.params;
        const flight = await Flight.findOne({ cid: cid });

        if (flight) {
            res.status(200).json(flight);
        } else {
            res.status(200).json();
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.searchFlight = async (req, res) => {
    try {
        const { departure, destination, departure_datetime, arrival_datetime } =
            req.query;

        let flights;

        if (departure === "anywhere" && destination !== "anywhere") {
            let options = {
                destination: {
                    $regex: destination,
                },
                departure_datetime: {
                    $gte: moment(+departure_datetime).toDate(),
                },
            };
            if (arrival_datetime) {
                options.departure_datetime = {
                    $gte: moment(+departure_datetime).toDate(),
                    $lte: moment(+arrival_datetime)
                        .subtract(1, "day")
                        .toDate(),
                };
                options.arrival_datetime = {
                    $gte: moment(+departure_datetime)
                        .add(1, "day")
                        .toDate(),
                    $lte: moment(+arrival_datetime).toDate(),
                };
            }

            flights = await Flight.find(options);

        }
        else if (destination === "anywhere" && departure !== "anywhere") {
            let options = {
                departure: {
                    $regex: departure,
                },
                departure_datetime: {
                    $gte: moment(+departure_datetime).toDate(),
                },
            };

            if (arrival_datetime) {
                options.departure_datetime = {
                    $gte: moment(+departure_datetime).toDate(),
                    $lte: moment(+arrival_datetime)
                        .subtract(1, "day")
                        .toDate(),
                };
                options.arrival_datetime = {
                    $gte: moment(+departure_datetime)
                        .add(1, "day")
                        .toDate(),
                    $lte: moment(+arrival_datetime).toDate(),
                }
            }

            flights = await Flight.find(options);
        }
        else if (departure === "anywhere" && destination === "anywhere") {
            let options = {
                departure_datetime: {
                    $gte: moment(+departure_datetime).toDate(),
                },
            };

            if (arrival_datetime) {
                options.departure_datetime = {
                    $gte: moment(+departure_datetime).toDate(),
                    $lte: moment(+arrival_datetime)
                        .subtract(1, "day")
                        .toDate(),
                }
                options.arrival_datetime = {
                    $gte: moment(+departure_datetime)
                        .add(1, "day")
                        .toDate(),
                    $lte: moment(+arrival_datetime).toDate(),
                }
            }

            flights = await Flight.find(options);

        }
        else {
            let options = {
                departure: {
                    $regex: departure,
                },
                destination: {
                    $regex: destination,
                },
                departure_datetime: {
                    $gte: moment(+departure_datetime).toDate(),
                },
            };

            if (arrival_datetime) {
                options.departure_datetime = {
                    $gte: moment(+departure_datetime).toDate(),
                    $lte: moment(+arrival_datetime)
                        .subtract(1, "day")
                        .toDate(),
                }
                options.arrival_datetime = {
                    $gte: moment(+departure_datetime)
                        .add(1, "day")
                        .toDate(),
                    $lte: moment(+arrival_datetime).toDate(),
                };
            }

            flights = await Flight.find(options);
        }

        if (flights.length) {
            res.status(200).json(flights);
        } else {
            res.status(200).json([]);
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.createFlight = async (req, res) => {
    try {
        const flightNum_generator = await generateRandFlightNum();
        var ObjectID = require("mongodb").ObjectID;
        var objectId = new ObjectID();
        const newFlight = new Flight({
            cid: objectId,
            flight_num: flightNum_generator,
            ...req.body,
        });
        await newFlight.save();
        res.status(200).json(newFlight);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.updateFlight = async (req, res) => {
    try {
        console.log(req.body);
        const result = await Flight.findOneAndUpdate(
            { cid: req.body.cid },
            { ...req.body },
            { new: true }
        );
        if (result) {
            console.log("OK!");
            res.status(200).json("Flight updated successfully!");
        } else {
            console.log("problem");
            res.status(404).json({ message: err.message });
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.removeFlight = async (req, res) => {
    try {
        const { cid } = req.body;
        const result = await Flight.deleteOne({ cid: cid });
        if (result.deletedCount === 1) {
            console.log("OK!");
            res.status(200).json("Flight removed successfully!");
        } else {
            console.log("problem");
            res.status(404).json({ message: err.message });
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const generateRandFlightNum = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "123456789";

    var result = "";
    for (var i = 0; i < 2; i++)
        result += chars[Math.floor(Math.random() * chars.length)];
    for (var i = 0; i < 3; i++)
        result += nums[Math.floor(Math.random() * nums.length)];

    const checkResult = await Flight.find({ flight_num: result });
    return checkResult.length ? await generateRandFlightNum() : result;
};
