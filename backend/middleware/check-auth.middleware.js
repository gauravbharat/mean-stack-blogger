const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  /** Get the token,
   * EITHER accept it from the query object e.g. req.query.auth with the token being passed as
   * http://localhost:3000/api/posts?auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6I…TYyfQ.1eH5Ahmm2KMR19d00MQo0OMAlhenpruiV_oYGDgHpcc
   * OR from the header part .e.g req.headers.authorization
   *
   * Split the headers auth token to remove the previx 'Bearer' before the token
   *
   */
  try {
    const token = req.headers.authorization.split(" ")[1];

    // Verify token. jwt.verify() would throw an error if failed
    const decodedToken = jwt.verify(token, process.env.JWT_SECTRE);

    // Pass the email and userId, from the decoded JWT token, to the continuing request object
    req.userData = {
      email: decodedToken.email,
      userId: decodedToken.userId,
    };

    next(); // all good, continue
  } catch (error) {
    res.status(401).json({ message: "You are not authenticated!" });
  }
};
