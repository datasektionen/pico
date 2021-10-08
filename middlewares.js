import axios from "axios";
import { validationResult } from "express-validator";
import configuration from "./configuration.js";

export const validationCheck = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const authorizePls = async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    let token;
    if (authorizationHeader) {
        token = authorizationHeader.split(" ")[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    if (!token || token.length === 0) {
        res.sendStatus(401);
        return;
    }

    try {
        const response = await axios.get(`${configuration.LOGIN_API_URL}/verify/${token}.json?api_key=${configuration.LOGIN_API_KEY}`);
        if (response.status !== 200) {
            res.sendStatus(401);
            return;
        }

        const user = response.data;

        const plsResponse = await axios.get(`${configuration.PLS_API_URL}/user/${user.user}/pico`);
        req.user = { ...user, pls: plsResponse.data };

        next();
    } catch (err) {
        res.sendStatus(401);
        return;
    }
};

export const adminAuth = async (req, res, next) => {
    if (req.user.pls.includes("admin")) return next();

    res.sendStatus(401);
};

// Checks authorization but does not reject.
// Takes token either in Authorization header or as a query string
export const silentAuthorization = async (req, res, next)=> {
    const authorizationHeader = req.headers.authorization;
    let token;
    if (authorizationHeader) {
        token = authorizationHeader.split(" ")[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    if (!token || token.length === 0) {
        next();
        return;
    }

    try {
        const response = await axios.get(`${configuration.LOGIN_API_URL}/verify/${token}.json?api_key=${configuration.LOGIN_API_KEY}`);
        if (response.status !== 200) {
            next();
            return;
        }

        const user = response.data;

        const plsResponse = await axios.get(`${configuration.PLS_API_URL}/user/${user.user}/pico`);
        req.user = { ...user, pls: plsResponse.data };

        next();
    } catch (err) {
        next();
    }
};