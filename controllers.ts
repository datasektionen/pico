import { Request, Response } from "express";
import Item from "./models/Item";
import { banned, generateShortString, getContext } from "./utils";

// Checks if a token is valid
// Returns user info or 400
export const checkToken = async (req: Request, res: Response) => {
    const { user } = getContext();
    if (!user) return res.sendStatus(400);
    return res.status(200).json(user);
};

export const createLink = async (req: Request, res: Response) => {
    const { url, desired, mandate, expires } = req.body;

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
        // user: req.user.user,
        user: user.user,
        expires: expires ?? null,
    };

    if (mandate) data["mandate"] = mandate;

    // If specified a desired short url
    if (desired) {
        data["short"] = desired;
        const desiredExists = await Item.findOne({ short: desired });
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
    console.log(user);

    // if (req.user.pls.includes("admin")) {
    if (user.pls.includes("admin")) {
        // Find everything
        query = Item.find({});
    } else {
        // Find links belonging to the user or the users' mandates or the users' groups
        query = Item.find({
            $or: [
                // { user: req.user.user },
                // ...req.user.mandates.map((m) => ({ mandate: m.identifier })),
                // ...req.user.groups.map((g) => ({ mandate: g.identifier })),
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
        { short: code },
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
    console.log(user);

    // Creator of link, has same mandate as link, or is admin
    const hasAccess =
        // item.user === req.user.user ||
        // req.user.mandates.map((m) => m.identifier).includes(item.mandate) ||
        // req.user.groups.map((g) => g.identifier).includes(item.mandate) ||
        // req.user.pls.includes("admin");
        item.user === user.user ||
        user.mandates.map((m) => m.identifier).includes(item.mandate) ||
        user.groups.map((g) => g.identifier).includes(item.mandate) ||
        user.pls.includes("admin");

    if (hasAccess) {
        await Item.deleteOne({ short: code });
        return res.sendStatus(200);
    } else {
        return res.sendStatus(403);
    }
};
