const express = require("express")
const router = express.Router()
const { register, login,update, deleteUser, logout } = require("../middleware/auth");
const { sendEmail } = require("../middleware/mail");

router.route("/register").post(register)
router.route("/login").post(login);
router.route("/update").put(update);
router.route("/deleteUser").delete(deleteUser);
router.route("/logout").post(logout);

router.route("/mail").post(sendEmail);

module.exports = router
