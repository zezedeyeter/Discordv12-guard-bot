const mongoose = require("mongoose");

const channelData = mongoose.Schema({

    Id: String,
    Pozisyon: Number,
    Izınler: Array

});

module.exports = mongoose.model("category", channelData);