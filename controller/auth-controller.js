const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

const algorithm = "aes-256-ctr";
const secretKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.sendStatus(401);
        }
        else {
            const hash = {
                iv: user.password.split('-')[0],
                content: user.password.split('-')[1]
            };
            
            if (decrypt(hash) === password) {
                var token = jwt.sign(
                    { userEmail: user.email },
                    process.env.TOKEN_KEY + "",
                    {
                        expiresIn: "2h",
                    }
                );
                res.status(200).send({
                    token,
                    name: user.name,
                    userType: user.userType,
                    email: user.email,
                    phone: user.phone,
                });
            } else {
                res.status(401).json({
                    message: "User credentials are incorrect",
                });
            }
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        var ObjectID = require("mongodb").ObjectID;
        var objectId = new ObjectID();
        
        const encrypted = encrypt(req.body.password);

        const newUser = new User({
            ...req.body,
            cid: objectId,
            password: `${encrypted?.iv}-${encrypted?.content}`,
        });
        await newUser.save();

        res.status(200).json(newUser);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString("hex"),
        content: encrypted.toString("hex"),
    };
};

const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(
        algorithm,
        secretKey,
        Buffer.from(hash.iv, "hex")
    );

    const decrpyted = Buffer.concat([
        decipher.update(Buffer.from(hash.content, "hex")),
        decipher.final(),
    ]);

    return decrpyted.toString();
};