const mongoose = require("mongoose");

const channelData = mongoose.Schema({

    Id: String,
    Type: String,
    Name: String,
    Parent: String,
    Pozisyon: Number,
    Izınler: Array

});

module.exports = mongoose.model("channel", channelData);