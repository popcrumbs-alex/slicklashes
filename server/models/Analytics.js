const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
  userInfo: {
    email: {
      type: String,
    },
    name: {
      type: String,
    },
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  visitDate: {
    type: Date,
    default: Date.now,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  dropOffPoint: {
    type: String,
  },
  currentCheckPoint: {
    type: String,
  },
  finished: {
    type: Boolean,
  },
});

module.exports = Analytics = mongoose.model("Analytics", AnalyticsSchema);
