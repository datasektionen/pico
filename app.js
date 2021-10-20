import express from "express";
const app = express();
import cryptoRandomString from "crypto-random-string";
import cors from "cors";
import configuration from "./configuration.js";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";
import fs from "fs";
const __dirname = path.resolve();
import Item from "./models/Item.js";
import { body } from "express-validator";
import { authorizePls, validationCheck, silentAuthorization } from "./middlewares.js";

app.use(express.json());
app.use(cors());

(async () => {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(configuration.MONGO_URL);
        console.log("Connected to database successfully.");
    } catch (err) {
        console.log("Failed to connect to database.");
        console.log(err);
        process.exit(1);
    }
})();

// Log requests to console
if (configuration.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else if (configuration.NODE_ENV === "production") {
    app.use(morgan("common"));
}

const generateShortString = async () => {
    let iterator = 0;
    while (true && iterator < 1000) {
        const key = cryptoRandomString({ length: configuration.SHORT_URL_LENGTH, type: "alphanumeric" });
        if (await Item.findOne({ short: key }) == null) {
            return key;
        }
        iterator++;
    }
    throw new Error("Couldn't generate a unique shortened url. Try again.");
};

// Checks if a token is valid
// Returns user info or 400
app.get("/api/check-token",
    silentAuthorization,
    async (req, res) => {
        if (!req.user) return res.sendStatus(400);
        return res.status(200).json(req.user);
    });

// Read blacklist from file
const banned = {};
(async () => {
    console.log("Start read");
    const file = fs.readFileSync(path.join(__dirname, "resources", "everything.txt"));
    const lines = file.toString().split("\n");
    for (const line of lines) {
        if (line.startsWith("#")) continue;
        banned[line] = true;
    }
    console.log("Read file");
})();

app.post("/api/shorten",
    // You must be logged in, but you need no pls permissions
    authorizePls,
    body("url")
        .exists().withMessage("is required")
        .trim()
        .toLowerCase()
        .isURL({
            protocols: ["http", "https"],
            require_protocol: true,
        }).withMessage("should be a valid URL and include the protocol (http:// or https://)"),
    validationCheck,
    async (req, res) => {

        const { url } = req.body;

        // Check if url is already in database
        const exists = await Item.findOne({ url });
        if (exists) {
            return res.status(200).json(exists);
        }

        // Check blacklist
        const host = new URL(url).host;
        if (banned[host] || banned[`www.${host}`] || banned[host.replace(/www[.]/, "")]) {
            return res.status(400).json({
                errors: [
                    {
                        msg: `"${host}" is blacklisted`,
                        param: "url",
                    },
                ],
            });
        }

        generateShortString()
            .then(key => {
                Item.create({
                    short: key,
                    url,
                    user: req.user.user,
                })
                    .then(item => {
                        res.status(201).json(item);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).send(err);
                    });
            })
            .catch(err => {
                console.log(err);
                res.status(500).send(err);
            });
    });

app.get("/api/all",
    authorizePls,
    (req, res) => {
        let query;
        if (req.user.pls.includes("admin")) {
            query = Item.find({});
        } else {
            query = Item.find({ user: req.user.user });
        }

        query
            .then(data => res.json(data))
            .catch(err => res.status(500).send(err));
    });

app.get("/api/code/:code", async (req, res) => {
    const { code } = req.params;
    const item = await Item.findOneAndUpdate({ short: code }, { $inc: { clicks: 1 } });
    if (!item) return res.sendStatus(404);
    return res.status(200).json(item);
});

app.delete("/api/:code",
    authorizePls,
    async (req, res) => {
        const { code } = req.params;
        const item = await Item.findOne({ short: code });
        if (!item) return res.sendStatus(404);
        if (item.user === req.user.user || req.user.pls.includes("admin")) {
            await Item.deleteOne({ short: code });
            return res.sendStatus(200);
        } else {
            return res.sendStatus(401);
        }
    });

app.use(express.static(path.join(__dirname, "client", "build")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "client", "build", "index.html")));

const PORT = configuration.PORT;
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
