import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        short: String,
        url: String,
        date: {
            type: mongoose.Schema.Types.Date,
            default: Date.now,
        },
        user: String,
        clicks: {
            type: Number,
            default: 0,
        },
        expires: {
            type: mongoose.Schema.Types.Date,
            default: null,
        },
        description: String,
        mandate: String,
    },
    {
        versionKey: false,
    }
);

export const Item = mongoose.model("Item", schema);
