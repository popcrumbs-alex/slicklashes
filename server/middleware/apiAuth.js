module.exports = (req, res, next) => {
  const { adminCode } = req.body;
  if (process.env.ADMIN_CODE === adminCode) {
    next();
  } else {
    res.status(500).json({ msg: "Invalid Code" });
  }
};
