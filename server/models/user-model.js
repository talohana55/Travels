const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema(
    {
        cid: {
            type: String,
            required: true,
            unique: true,
        },
        userType: {
            type: String,
            default: "Member",
        },
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
    },
    { timestamps: true, cid: false }
);

const User = mongoose.model('users', usersSchema, 'users');
module.exports = User;