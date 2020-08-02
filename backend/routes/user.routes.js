const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user.controller");

router.post("/signup", UserController.createUser);
router.post("/login", UserController.userLogin);

module.exports = router;

/** JWT (JSON Web Token) =>
1. package of information, hashed into one long string
2. which is generated on the server upon a successful login or signup
3. that token is sent back to the browser where you can store it in the angular app, in the form of a cookie or in the localStorage
4. this token is then attached to all future requests as as part of the URL header, the token can't be faked and only requests with a valid token are allowed otherwise rejected */
