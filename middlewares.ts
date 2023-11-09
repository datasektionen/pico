import axios, { AxiosResponse, AxiosError } from "axios";
import { validationResult } from "express-validator";
import httpContext from "express-http-context";
import { configuration } from "./configuration";
import { NextFunction, Request, Response } from "express";
import { canCreateCustomLinks, getContext, hasMandate, isAdmin } from "./utils";
import { CurrentMandate, User } from "./types";

export const validationCheck = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const authorizePls = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authorizationHeader: string | undefined = req.headers.authorization;
    let token: string | undefined;

    if (authorizationHeader) {
        token = authorizationHeader.split(" ")[1];
    } else if (req.query.token) {
        token = req.query.token as string;
    }

    if (!token || token.length === 0) {
        res.sendStatus(401);
        return;
    }

    const loginUrl = `${configuration.LOGIN_API_URL}/verify/${token}.json?api_key=${configuration.LOGIN_API_KEY}`;
    let loginResponse: AxiosResponse;
    try {
        loginResponse = await axios.get(loginUrl);
    } catch (err) {
        const loginError = err as AxiosError;
        if (loginError.response) {
            const { status, data } = loginError.response;
            res.status(status).send(data);
        } else {
            res.status(502).send(
                "Bad Gateway - No response from the login API."
            );
        }
        return;
    }

    const user: User = loginResponse.data;

    const plsUrl = `${configuration.PLS_API_URL}/user/${user.user}/pico`;
    let plsResponse: AxiosResponse;
    try {
        plsResponse = await axios.get(plsUrl);
    } catch (err) {
        const plsError = err as AxiosError;
        if (plsError.response) {
            const { status, data } = plsError.response;
            res.status(status).send(data);
        } else {
            res.status(502).send("Bad Gateway - No response from the PLS API.");
        }
        return;
    }

    let mandates: { title: string; identifier: string }[] = [];
    let groups: { name: string; identifier: string }[] = [];
    try {
        // Fetch user's mandates from dfunkt
        // TODO: Cache this
        const dfunktUrl = `https://dfunkt.datasektionen.se/api/user/kthid/${user.user}/current`;
        const dfunktResponse = await axios.get(dfunktUrl);
        const result: CurrentMandate[] = dfunktResponse.data.mandates;
        mandates = result
            // Only save title and identifier
            .map((m) => ({
                title: m.Role.title,
                identifier: m.Role.identifier,
            }));
        groups = result
            .map((m) => ({
                name: m.Role.Group.name,
                identifier: m.Role.Group.identifier,
            }))
            .filter(
                (v, i, self) =>
                    i === self.findIndex((t) => t.identifier === v.identifier)
            );
    } catch (err) {
        const dfunktError = err as AxiosError;
        if (!dfunktError.isAxiosError) {
            res.status(500).send(
                "Internal Server Error - " + dfunktError.message
            );
            return;
        }
        if (dfunktError.response) {
            const { status, data } = dfunktError.response;
            // If status is 404, this user is simply not a dFunkt and the page
            // should proceed normally. Otherwise, return an error.
            if (status != 404) {
                res.status(status).send(data);
                return;
            }
        } else {
            res.status(502).send(
                "Bad Gateway - No response from the dFunkt API."
            );
            return;
        }
    }

    httpContext.set("user", {
        ...user,
        pls: plsResponse.data,
        mandates,
        groups,
    });

    next();
};

export const desiredAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.body.desired) {
        const { user } = getContext();
        if (canCreateCustomLinks(user) || isAdmin(user)) {
            return next();
        }
        res.sendStatus(403);
    } else {
        next();
    }
};

export const mandateAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { user } = getContext();
    const mandate = req.body.mandate;
    if (mandate) {
        if (!hasMandate(user, mandate) && !isAdmin(user)) {
            return res.status(403).json({
                error: "You are not allowed to assign to that mandate/group",
            });
        }
    }
    next();
};

export const adminAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { user } = getContext();
    if (isAdmin(user)) return next();

    res.sendStatus(403);
};

// Checks authorization but does not reject.
// Takes token either in Authorization header or as a query string
export const silentAuthorization = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
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
        const response = await axios.get(
            `${configuration.LOGIN_API_URL}/verify/${token}.json?api_key=${configuration.LOGIN_API_KEY}`
        );
        if (response.status !== 200) {
            next();
            return;
        }

        const user = response.data;

        const plsResponse = await axios.get(
            `${configuration.PLS_API_URL}/user/${user.user}/pico`
        );
        // req.user = { ...user, pls: plsResponse.data };
        httpContext.set("user", { ...user, pls: plsResponse.data });

        next();
    } catch (err) {
        next();
    }
};
