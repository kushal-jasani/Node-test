const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const reqheader = req.get("Authorization");
  console.log('********'+reqheader)
  if (!reqheader) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = req.get("Authorization").split(" ")[1];
  let decodedtoken;
  try {
    decodedtoken= jwt.verify(token, "secretsecret");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedtoken) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedtoken.userId;
  next();
};
