const bcrypt = require("bcryptjs");
const User = require("../models/user");
const validator = require("validator");
const Post = require("../models/post");
const jwt = require("jsonwebtoken");
const post = require("../models/post");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "email is invalid" });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "password too short" });
    }
    if (errors.length > 0) {
      const error = new Error("invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const exisitingUser = await User.findOne({ email: userInput.email });
    if (exisitingUser) {
      const error = new Error("user already exists");
      throw error;
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword,
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async function ({ email, password }) {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found");
      error.code = 401;
      throw error;
    }
    const isEqual = bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("password is incorrect");
    }
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      "secretsecret",
      { expiresIn: "1hr" }
    );
    return { token: token, userId: user._id.toString() };
  },
  createPost: async function ({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("User not validated");
      error.code = 401;
      throw error;
    }
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "title is invalid" });
    }
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "content is invalid" });
    }
    if (errors.length > 0) {
      const error = new Error("invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("invalid user");
      error.data = errors;
      error.code = 401;
      throw error;
    }
    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user,
    });
    const createPost = await post.save();
    user.posts.push(createPost);
    await user.save();
    return {
      ...createPost._doc,
      _id: createPost._id.toString(),
      createdAt: createPost.createdAt.toISOString(),
      updateAt: createPost.updatedAt.toISOString(),
    };
  },
  posts: async function ({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("User not validated");
      error.code = 401;
      throw error;
    }
    if (!page) {
      page = 1;
    }
    const perpage = 2;
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perpage)
      .limit(perpage)
      .populate("creator");
    return {
      posts: posts.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updateAt: p.updatedAt.toISOString(),
        };
      }),
      totalPosts: totalPosts,
    };
  },
};
