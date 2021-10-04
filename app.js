import express from "express";
const app = express();
import cryptoRandomString from 'crypto-random-string';
import cors from "cors";
import configuration from "./configuration.js";
import mongoose from "mongoose";
import Item from "./models/Item.js";
import { body } from "express-validator";
import { adminAuth, authorizePls, validationCheck } from "./middlewares.js"

app.use(express.json());
app.use(cors());

(async () => {
    try {
        console.log("Connecting to database...")
        await mongoose.connect(configuration.MONGO_URL);
        console.log("Connected to database successfully.");
    } catch (err) {
        console.log("Failed to connect to database.");
        console.log(err);
        process.exit(1);
    }
})();

const generateShortString = async () => {
    let iterator = 0;
    while (true && iterator < 1000) {
        console.log(configuration.SHORT_URL_LENGTH)
        const key = cryptoRandomString({ length: configuration.SHORT_URL_LENGTH, type: "alphanumeric" });
        if (await Item.findOne({ short: key }) == null) {
            return key;
        }
        iterator++;
    }
    throw new Error("Couldn't generate a unique shortened url. Try again.")
}

app.post("/api/shorten",
    // You must be logged in, but you need no pls permissions
    authorizePls,
    body("url")
    .exists().withMessage("is required")
    .isURL().withMessage("should be a valid URL"),
    validationCheck,
async (req, res) => {
    
    const { url } = req.body;

    // Check if url is already shortened
    const exists = await Item.findOne({ url });
    if (exists) {
        return res.status(200).json(exists)
    }

    // TODO: Blacklist URL:s
    
    generateShortString()
    .then(key => {
        Item.create({
            short: key,
            url,
            user: req.user.user
        })
        .then(item => {
            res.status(201).json(item)
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(err)
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).send(err)
    });
})

app.get("/api/all",
    authorizePls,
    // adminAuth,
(req, res) => {
    Item.find({})
    .then(data => res.json(data))
    .catch(err => res.send(err))
})

app.get("/:code", async (req, res) => {
    const { code } = req.params;
    const item = await Item.findOne({ short: code });
    if (!item) return res.sendStatus(404);
    return res.redirect(item.url);
})

const PORT = configuration.PORT;
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
