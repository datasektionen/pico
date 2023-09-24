import { Request, Response } from "express";
import { Item } from "./models";
import {
    banned,
    generateShortString,
    getContext,
    isAdmin,
    getHasDeleteAccess,
    isValidDesiredLink,
} from "./utils";

// Checks if a token is valid
// Returns user info or 400
export const checkToken = async (req: Request, res: Response) => {
    const { user } = getContext();
    if (!user) return res.sendStatus(400);
    return res.status(200).json(user);
};

export const createLink = async (req: Request, res: Response) => {
    const { url, mandate, expires } = req.body;
    // force lowercase on short name
    const desired = req.body.desired?.toLowerCase();

    // Check blacklist
    const host = new URL(url).host;
    if (
        banned[host] ||
        banned[`www.${host}`] ||
        banned[host.replace(/www[.]/, "")]
    ) {
        return res.status(400).json({
            errors: [
                {
                    msg: `"${host}" is blacklisted`,
                    param: "url",
                },
            ],
        });
    }

    const { user } = getContext();

    const data: any = {
        url,
        user: user.user,
        expires: expires ?? null,
    };

    if (mandate) {
        data["mandate"] = mandate;
    }

    // If specified a desired short url
    if (desired) {
        data["short"] = desired;
        const desiredExists = await Item.findOne({ short: desired });
        if (!isValidDesiredLink(desired)) {
            return res.status(400).json({
                errors: [
                    {
                        msg: `"${desired}" is invalid, valid characters are [a-z0-9], '-' and '_'`,
                        param: "",
                    },
                ],
            });
        }
        if (desiredExists !== null) {
            return res.status(400).json({
                errors: [
                    {
                        msg: `"${desired}" already exists`,
                        param: "",
                    },
                ],
            });
        }
        // No desired url specified
    } else {
        try {
            data["short"] = await generateShortString();
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    }

    Item.create(data)
        .then((item) => {
            res.status(201).json(item);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send(err);
        });
};

export const getAllLinks = async (req: Request, res: Response) => {
    let query;

    const { user } = getContext();

    if (isAdmin(user)) {
        // Find everything
        query = Item.find({});
    } else {
        // Find links belonging to the user or the users' mandates or the users' groups
        query = Item.find({
            $or: [
                { user: user.user },
                ...user.mandates.map((m) => ({ mandate: m.identifier })),
                ...user.groups.map((g) => ({ mandate: g.identifier })),
            ],
        });
    }

    query
        .then((data) => res.json(data))
        .catch((err) => res.status(500).send(err));
};

export const getLink = async (req: Request, res: Response) => {
    const { code } = req.params;
    const item = await Item.findOneAndUpdate(
        { short: code.toLowerCase() },
        { $inc: { clicks: 1 } }
    );
    if (!item) return res.sendStatus(404);
    return res.status(200).json(item);
};

export const deleteLink = async (req: Request, res: Response) => {
    const { code } = req.params;
    const item = await Item.findOne({ short: code });
    if (!item) return res.sendStatus(404);

    const { user } = getContext();

    const hasAccess = getHasDeleteAccess(user, item);

    if (hasAccess) {
        await Item.deleteOne({ short: code });
        return res.sendStatus(200);
    } else {
        return res.sendStatus(403);
    }
};
