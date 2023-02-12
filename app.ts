import express from "express";
import cors from "cors";
import { configuration } from "./configuration";
import mongoose from "mongoose";
import morgan from "morgan";
import { Item } from "./models";
import { router } from "./router";

import { CronJob } from "cron";
import httpContext from "express-http-context";

const app = express();
app.use(express.json());
app.use(cors());
app.use(httpContext.middleware);

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

app.use(router);

// Clears all links which "expired" field is less than the current time
// Entries with "expired: null" are not removed (as expected)
const clearExpiredLinks = async () => {
    const ids = (await Item.where("expires").lte(Date.now())).map((x) => x._id);

    const result = await Promise.all(
        ids.map((id) => {
            return Item.findByIdAndDelete(id);
        }),
    );

    if (result.length > 0) {
        console.log(`Removed ${result.length} expired link(s) from database.`);
    }
};

// second (0-59), min (0-59), h (0-23), day-of-month (1-31), month (0-11), weekday (0-6)
// This job is run once per minute
new CronJob("0 * * * * *", clearExpiredLinks, null, true);

const PORT = configuration.PORT;
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
