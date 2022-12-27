const express = require("express");

const {
    getTickets,
    getTicketById,
    createTicket
} = require("../controller/ticket-controller");

const router = express.Router();

router.route("/api/tickets/get").get(getTickets);
router.route("/api/tickets/search/id").get(getTicketById);
router.route("/api/tickets/create").post(createTicket);

module.exports = router;