import mongoose from "mongoose";

const schema = new mongoose.Schema({
    short: String,
    url: String,
    date: {
        type: mongoose.Schema.Types.Date,
        default: Date.now
    },
    user: String,
}, {
    versionKey: false
});

const Item = mongoose.model("Item", schema);
// await Item.createCollection();

export default Item;