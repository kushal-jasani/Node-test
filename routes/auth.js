const express = require("express");
const { body } = require("express-validator");
const authController=require('../controller/auth')
const User=require('../models/user')
const router = express.Router();

router.put("/signup", [
  body("email")
    .isEmail()
    .withMessage("please enter valid email")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("email already exists");
        }
      });
    })
    .normalizeEmail(),
  body("password").trim().isLength({ min: 5 }),
  body("name").trim().not().isEmpty(),
],authController.signup);

router.get('/status', isAuth, authController.getUserStatus);
router.post('/login',authController.login);

module.exports = router;
