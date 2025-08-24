const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { createSendToken } = require("../utils/signToken");

exports.signUp = catchAsync(async (req, res, next) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return next(new AppError("Missing required fields", 400));
    }
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return next(new AppError("User already exists", 409));
    }
  
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
  
    createSendToken(newUser, 201, res);
  });

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError("Please provide username and password", 400));
  }

  const user = await User.findOne({ username }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect username or password", 401));
  }

  const token = signToken(user._id, user.role);

  res.status(200).json({
    status: "success",
    token,
  });
});
