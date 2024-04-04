const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token =
      req.headers["authorization"] &&
      req.headers["authorization"].split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "Auth Failed: Token missing" });
    }

    JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res
          .status(401)
          .send({ success: false, message: "Auth Failed: Invalid token" });
      } else {
        // Assuming the decoded token contains user role information
        const isAdmin = decode.isAdmin;
        // Check if the user has the 'admin' role
        if (isAdmin) {
          req.body.userId = decode.id;
          next();
        } else {
          return res.status(403).send({
            success: false,
            message: "Access Denied: Insufficient permissions",
          });
        }
      }
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({ success: false, message: "Auth Failed" });
  }
};
