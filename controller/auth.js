const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation error");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
    });
    const result = await user.save();

    res.status(201).json({ message: "user created", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadeduser;
  try{
  const user=await User.findOne({ email: email })

      if (!user) {
        const error = new Error("user with this email could not be found");
        error.statusCode = 401;
        throw error;
      }
      loadeduser = user;
      const isEqual=await bcrypt.compare(password, user.password);
      if (!isEqual) {
        const error = new Error("wrong password enterd");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadeduser.email,
          userId: loadeduser._id.toString(),
        },
        "secretsecret",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadeduser._id.toString() });
    }
    catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    };
};
