const mongoose = require("mongoose");

const travelRouteSchema = new mongoose.Schema(
    {
        cid: {
            type: String,
            required: true,
            unique: true,
        },
        from: {
            type: String,
            required: true,
        },
        // originate in country
        to: {
            type: String,
            required: true,
        },
        distance: {
            type: String,
            required: true,

        },
        estimated_flight_time: {
            type: String,
            required: true,
        }
    }, { timestamps: true, cid: false }
);

const TravelRoute = mongoose.model("travelRoutes", travelRouteSchema, "travelRoutes");
module.exports = TravelRoute;
