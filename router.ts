import express, { Router } from "express";
import { body } from "express-validator";
import path from "path";
import {
    authorizePls,
    desiredAuth,
    mandateAuth,
    silentAuthorization,
    validationCheck,
} from "./middlewares";
import {
    createLink,
    deleteLink,
    getAllLinks,
    getLink,
    checkToken,
} from "./services";

const r = Router();

r.get("/api/check-token", silentAuthorization, checkToken);
r.post(
    "/api/shorten",
    // You must be logged in, but you need no pls permissions
    authorizePls,
    desiredAuth,
    mandateAuth,
    body("url")
        .exists()
        .withMessage("is required")
        .trim()
        .isURL({
            protocols: ["http", "https"],
            require_protocol: true,
        })
        .withMessage(
            "should be a valid URL and include the protocol (http:// or https://)"
        ),
    body("desired")
        .optional()
        .isString()
        .withMessage("should be a string")
        .trim(),
    body("expires")
        .optional()
        .isInt({ gt: Date.now() })
        .withMessage(
            `should be an int greater than current unix time in ms (${Date.now()} )`
        ),
    body("mandate")
        .optional()
        .isString()
        .withMessage("should be a string")
        .trim(),
    validationCheck,
    createLink
);

r.get("/api/all", authorizePls, getAllLinks);

r.get("/api/code/:code", getLink);

r.delete("/api/:code", authorizePls, deleteLink);

r.use(express.static(path.join(__dirname, "client", "build")));
r.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "client", "build", "index.html"))
);

export const router = r;
