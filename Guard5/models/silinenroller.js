const mongoose = require("mongoose");

const deletedrole = mongoose.Schema({

    roleid: String,
    rolename: String,
    Tarih: Number,
});

module.exports = mongoose.model("deletedrole", deletedrole);