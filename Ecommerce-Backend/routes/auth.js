const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { signOut, signup, signin, isSignedIn } = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("name", "Name should be at least 3 char").isLength({ min: 3 }),
    check("email", "Email is required").isEmail(),
    check("password", "Password should be at least 7 char").isLength({
      min: 7,
    }),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isLength({
      min: 7,
    }),
  ],
  signin
);
router.get("/signout", signOut);
router.get("/testroute", isSignedIn, (req, res) => {
  return res.json(req.auth);
});

module.exports = router;
