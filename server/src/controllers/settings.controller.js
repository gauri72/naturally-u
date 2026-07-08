const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings.model');

// Singleton pattern: there is only ever one Settings document
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json(settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
});

module.exports = { getSettings, updateSettings };
