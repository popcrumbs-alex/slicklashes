const express = require("express");
const Analytics = require("../models/Analytics");
const auth = require("../middleware/auth");
const router = express.Router();

//@route POST route
//@desc create analytics funnel
//@access public
router.post("/track", async (req, res) => {
  const { checkPoint, userID } = req.body;

  const foundUser = await Analytics.findById(userID);

  const dataFields = {};
  console.log("checkpoint tracking", checkPoint, userID, foundUser);
  if (foundUser) {
    foundUser.currentCheckPoint = checkPoint;
    const newEndTime = new Date();
    foundUser.endTime = newEndTime.getTime();

    try {
      await foundUser.save();

      return res.json(foundUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }

  if (checkPoint) dataFields.currentCheckPoint = checkPoint;

  const startingPoint = new Date();

  dataFields.startTime = startingPoint.getTime();
  dataFields.endTime = startingPoint.getTime();

  const newAnalyticsStream = new Analytics({ ...dataFields });
  console.log(newAnalyticsStream);
  try {
    await newAnalyticsStream.save();
    // console.log("Analytics data saved", newAnalyticsStream);
    res.json(newAnalyticsStream);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route GET route
//@desc get total pageviews
//@access private
router.get("/pageviews", auth, async (req, res) => {
  const allViews = await Analytics.find();

  try {
    res.json(allViews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route GET route
//@desc get all tracking data
//@access privaate
router.get("/tracking", auth, async (req, res) => {
  const foundTrackingInfo = await Analytics.find();

  try {
    res.json(foundTrackingInfo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
