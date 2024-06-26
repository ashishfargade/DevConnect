const express = require("express");
const { check, validationResult } = require("express-validator");
const request = require("request");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { githubClientId, githubSecret } = require("../../config");

const router = express.Router();
const request = require('request');

// @route GET api/profile
// @desc Get logged user profile
// @access Public
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ message: "No Profile for current user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route POST api/profile
// @desc Fill user profile
// @access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build Profile Object
    const profileFields = {};
    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    // skills currently a string, using ',' as delimiter separate and remove spaces using trim
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json({ profile });
      }

      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }

    //console.log(skills);
  }
);

// @route GET api/profile
// @desc Get all profiles
// @access Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route GET api/profile/user/:user_id
// @desc Get profile by userid
// @access Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    //Check if profile exists
    if (!profile) return res.status(400).json({ message: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error(err);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ message: "Profile not found" });
    }
    res.status(500).json("Server Error");
  }
});

// @route DELETE api/profile
// @desc Delete profile, user and posts
// @access Private
router.delete("/", async (req, res) => {
  try {
    // @todo = remove user posts

    // Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ message: "User Deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route PUT api/profile/experience
// @desc Add profile experience
// @access Private
router.put(
  "/experience",
  [
    auth,
    check("title", "Title is required").not().isEmpty(),
    check("company", "Company is required").not().isEmpty(),
    check("from", "From date is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
  );

  // @route PUT api/profile/education
  // @desc Add profile education
  // @access Private
  router.put(
    "/education",
    [
      auth,
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
      }
  
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body;
  
      const newEdu = {
        school,
        degree,
        fieldofstudy, 
        from,
        to,
        current,
        description
      }
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

// @route DELETE api/profile/experience/:exp_id
// @desc DELETE experience from profile
// @access Profile
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);

    await profile.save()
    res.json(profile);

  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }
});


// @route DELETE api/profile/education/:id
// @desc Delete education
// @access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);

    await profile.save()
    res.json(profile);

  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
