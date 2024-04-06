const express = require("express");
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require("express-validator");
const User = require('../../models/User');
const { jwtSecret } = require('../../config.js');

// @route POST api/users
// @desc REGISTER USER
// @access Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Min 6 character required for password").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {name, email, password} = req.body;

    try {
        // Check if the user exists
        let user = await User.findOne({ email: email });

        if(user){
            return res.status(400).json({ errors: [{msg: 'User already exists'}] });
        }

        // Get user gravatar
        const avatar = gravatar.url(email,{
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        //Create user
        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Return jsonwebtoken
        const payload = {
          user: {
            id: user.id
          }
        }

        jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
          if(err) throw err;
          res.json({ token });
        })

        //res.send('User Registered');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

    console.log(req.body);
  }
);

module.exports = router;
