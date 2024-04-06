const express = require("express");
const auth = require("../../middleware/auth");
const { check, validationResult } = require('express-validator');
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route GET api/profile
// @desc Get logged user profile
// @access Public
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if(!profile){
        return res.status(400).json({message: 'No Profile for current user'});
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route POST api/profile
// @desc Fill user profile
// @access Public
router.post("/", [auth, [
    
]], (req, res) => {
    
});

module.exports = router;