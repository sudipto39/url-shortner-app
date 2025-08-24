const Url = require("../models/Url");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { createSendToken } = require("../utils/signToken");
const User = require("../models/User");

exports.adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide both email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  console.log("user",user);
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isCorrect = await user.correctPassword(password,user.password);
  console.log("user.password",user.password);
  console.log("isCorrect",isCorrect);
  if (!isCorrect) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (user.role !== "admin") {
    return next(new AppError("Access denied: Admins only", 403));
  }
  createSendToken(user, 200, res);

});

exports.getAllUsers = catchAsync(async (_req, res, _next) => {
  const users = await User.find().select("+password");

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

exports.listUrls = catchAsync(async (req, res, next) => {
  const urls = await Url.find({}, "originalUrl shortCode visitCount").lean();

  if (!urls || urls.length === 0) {
    return next(new AppError("No URLs found", 404));
  }

  res.status(200).json({
    status: "success",
    results: urls.length,
    data: {
      urls,
    },
  });
});