const User = require('../models/user-model');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        if (users.length) {
            res.status(200).json(users);
        }
        else {
            res.status(200).json([]);
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}