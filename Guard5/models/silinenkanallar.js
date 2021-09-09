const mongoose = require("mongoose");

const data = mongoose.Schema({
    guildID: String,
    kanallar: Array,
    roller: Array,
});

module.exports = mongoose.model("silinenveriler", data)