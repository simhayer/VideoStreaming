const express = require("express")
const router = express.Router()
const { register, login,update, deleteUser, logout,sendResetCode,verifyResetCode,updatePassword } = require("../middleware/auth");
//const { sendEmail } = require("../middleware/mail");

router.route("/register").post(register)
router.route("/login").post(login);
router.route("/update").put(update);
router.route("/deleteUser").delete(deleteUser);
router.route("/logout").post(logout);

router.route("/passwordMail").post(sendResetCode);
router.route("/verifyResetCode").post(verifyResetCode);
router.route("/updatePassword").post(updatePassword);

module.exports = router
