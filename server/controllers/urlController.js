const Url = require("../models/Url");
const { nanoid } = require("nanoid");
const validator = require("validator");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.shortenUrl = catchAsync(async (req, res, next) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return next(new AppError("originalUrl is required", 400));
  }
  if (!validator.isURL(originalUrl, { require_protocol: true })) {
    return next(
      new AppError("Invalid URL. Please include http:// or https://", 400)
    );
  }

  let url = await Url.findOne({ originalUrl });
  if (url) {
    return res.status(200).json({
      shortUrl: `${req.protocol}://${req.get("host")}/${url.shortCode}`,
    });
  }

  let shortCode;
  let exists = true;
  while (exists) {
    shortCode = nanoid(6);
    exists = await Url.findOne({ shortCode });
  }

  url = new Url({ originalUrl, shortCode });
  await url.save();

  res.status(201).json({
    shortUrl: `${req.protocol}://${req.get("host")}/${shortCode}`,
  });
});

exports.redirectToOriginal = catchAsync(async (req, res, next) => {
  const { shortcode } = req.params;

  const url = await Url.findOne({ shortCode: shortcode });

  if (!url) {
    return next(new AppError("Short URL not found", 404));
  }

  url.visitCount += 1;
  await url.save();

  res.redirect(url.originalUrl);
});
