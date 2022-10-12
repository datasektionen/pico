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

const PLS_PERMISSIONS = {
    ADMIN: "admin",
    CUSTOM_LINK: "custom-link",
};

// TODO: Test
export const isAdmin = (user: User) => {
    return user.pls.includes(PLS_PERMISSIONS.ADMIN);
};

// TODO: Test
export const canCreateCustomLinks = (user: User) => {
    return user.pls.includes(PLS_PERMISSIONS.CUSTOM_LINK);
};

// TODO: Test
export const hasMandate = (user: User, mandate: string) =>
    user.mandates.map((m) => m.identifier).includes(mandate) ||
    user.groups.map((g) => g.identifier).includes(mandate);

// If there is no mandate on the link, and the user owns it, returns true
// If there is a mandate on the link, and the user currently holds that mandate, return true
// If the user is admin, return true
// Else return false
// TODO: Test
export const getHasDeleteAccess = (user: User, item: any): boolean => {
    if (isAdmin(user)) return true;

    if (item.mandate) {
        if (hasMandate(user, item.mandate)) return true;
    } else {
        if (item.user === user.user) return true;
    }
    return false;
};

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
