const { Router } = require("express");
const clientRouter = require("./client.routes.js");
const otpRouter = require("./otp.routes.js");

const router = Router();

router.use('/client', clientRouter);
router.use('/otp', otpRouter);


module.exports = router;