const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + "/dist"));

app.route("/*", function (req, res) {
    res.redirect(__dirname + "/dist/index.html");
});

const authRoutes = require("./routes/auth-routes");
const userRoutes = require("./routes/user-routes");
const flightRoutes = require("./routes/flight-routes");
const airlineRoutes = require("./routes/airline-routes");
const travelRouteRoutes = require("./routes/travelRoute-routes");
const stateRoutes = require("./routes/state-routes");
const ticketRoutes = require("./routes/ticket-routes");
const orderRoutes = require("./routes/order-routes");

app.use(authRoutes);
app.use(userRoutes);
app.use(flightRoutes);
app.use(airlineRoutes);
app.use(travelRouteRoutes);
app.use(stateRoutes);
app.use(ticketRoutes);
app.use(orderRoutes);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
    );
    next();
});

require('dotenv').config();
const uri = process.env.MONGO_URI
async function connect() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
    }
}
connect();
app.listen(PORT, console.log(`The server is running on port: ${PORT}`));