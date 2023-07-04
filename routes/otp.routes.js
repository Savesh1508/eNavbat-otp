const { Router } = require("express");
const {
    newOTP,
    verifyOTP,
    deleteOTP,
    getOTPById
} = require("../controllers/otp.controllers.js");

const router = Router();

router.post('/newotp', newOTP);
router.post('/verify', verifyOTP);
router.delete('/delete', deleteOTP);
router.get('/:id', getOTPById);


module.exports = router;