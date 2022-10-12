import { configuration } from "./configuration";
import cryptoRandomString from "crypto-random-string";
import httpContext from "express-http-context";
import path from "path";
import fs from "fs";
import { Context, User } from "./types";
import Item from "./models/Item";

export const getContext = (): Context => ({
    user: httpContext.get("user") as User,
});

export const generateShortString = async () => {
    let iterator = 0;
    while (true && iterator < 1000) {
        const key = cryptoRandomString({
            length: configuration.SHORT_URL_LENGTH,
            type: "base64",
        });
        if ((await Item.findOne({ short: key })) == null) {
            return key;
        }
        iterator++;
    }
    throw new Error("Couldn't generate a unique shortened url. Try again.");
};

export const banned: Record<string, boolean> = {};

const getBlackList = () => {
    // Read blacklist from file
    (async () => {
        console.log("Start read");
        const file = fs.readFileSync(
            path.join(__dirname, "resources", "everything.txt")
        );
        const lines = file.toString().split("\n");
        for (const line of lines) {
            if (line.startsWith("#")) continue;
            banned[line] = true;
        }
        console.log("Read file");
    })();
};

getBlackList();
