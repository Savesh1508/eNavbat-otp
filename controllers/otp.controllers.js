const { encode, decode } = require("../services/crypt.js");
const pool = require("../config/db.js");
const uuid = require('uuid');
const { v4: uuidv4 } = require('uuid');
// uuid.v4()

const otpGenerator = require("otp-generator");
const { AddMinutesToDate } = require("../helpers/add_minutes_to_date.js");
const dateHelper = require("../helpers/dates.js");


const newOTP = async(req, res) => {
    const { phone_number } = req.body;
    //Generate OTP
    const otp = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    const now = new Date();
    const expiration_time = AddMinutesToDate(now, 3);

    const newOtp = await pool.query(
        `INSERT INTO otp(id, otp, expiration_time) VALUES ($1, $2, $3) returning id;`,
        [uuidv4(), otp, expiration_time]
    );

    const details = {
        timestamp: now,
        user_phone: phone_number,
        success: true,
        message: "OTP succesfully sended to user!",
        otp_id: newOtp.rows[0].id,
    };
    // console.log(details);

    const encoded = await encode(JSON.stringify(details));
    return res.send({Status: "Success", Details: encoded});
}; // NEW OTP


const verifyOTP = async(req, res) => {
    const { verification_key, otp, user_phone } = req.body;
    var currentdate = new Date();
    let decoding;

    try {
        decoding = await decode(verification_key);
    } catch (error) {
        return res.status(400).send({Status: "Failure", Details: "Bad Request!"});
    }

    var decoded_info = JSON.parse(decoding);
    const check_phone = decoded_info.user_phone;

    if (check_phone != user_phone) {
        return res.status(400).send({Status: "Failure", Details: "OTP was not sent to this particular phone number!"});
    }

    const otpResult = await pool.query(
        `SELECT * FROM otp WHERE id = $1;`,
        [decoded_info.otp_id]
    );

    const result = otpResult.rows[0];
    // CHECK IF OTP IS EMPTY
    if (result != null) {
        // CHECK IF OTP IS ALREADY USED OR NOT
        if (result.verified != true) {
            // CHECK IF OTP IS EXPIRED OR NOT
            if (dateHelper.dates.compare(result.expiration_time, currentdate) == 1) {
                // CHECK IF OTP IS EQUAL TO THE OTP IN THE DB
                if (otp == result.otp) {
                    await pool.query(
                        `UPDATE otp SET verified = $1 WHERE id = $2`,
                        [true, result.id]
                    );

                    const clientResult = await pool.query(
                        `SELECT * FROM client WHERE client_phone_number = $1`,
                        [check_phone]
                    );

                    if (clientResult.rows.length == 0) {
                        return res.status(200).send({
                            Status: "Success",
                            Details: "new",
                            Phone: check_phone
                        })
                    } else {
                        return res.status(200).send({
                            Status: "Success",
                            Details: "old",
                            Phone: user_phone,
                            ClientName: clientResult.rows[0].client_first_name
                        });
                    };
                } else {
                    // CHECK IF OTP IS EQUAL TO THE OTP IN THE DB
                    return res.status(400).send({Status: "Failure", Details: "OTP NOT Matched!"});
                };
            } else {
                // CHECK IF OTP IS EXPIRED OR NOT
                return res.status(400).send({Status: "Failure", Details: "OTP Expired!"});
            };
        } else {
            // CHECK IF OTP IS ALREADY USED OR NOT
            return res.status(400).send({Status: "Failure", Details: "OTP Already Used!"});
        };
    } else {
        // CHECK IF OTP IS EMPTY
        return res.status(400).send({Status: "Failure", Details: "Bad Request!"});
    };
}; // VERIFY OTP

const deleteOTP = async(req, res) => {
    const { verification_key, user_phone } = req.body;

    let decoding
    try {
        decoding = await decode(verification_key);
    } catch (error) {
        return res.status(400).send({Status: "Failure", Details: "Bad Request!"});
    }

    var decoded_info = JSON.parse(decoding);
    const check_phone = decoded_info.user_phone;

    if (check_phone != user_phone) {
        return res.status(400).send({Status: "Failure", Details: "OTP was not sent to this particular phone number!"});
    }

    const deletedOTP = await pool.query(
        `DELETE FROM otp WHERE id = $1 RETURNING id;`,
        [decoded_info.otp_id]
    );

    if (deletedOTP.rows.length == 0) {
        return res.status(400).send("Invalid OTP");
    }

    return res.status(200).send(decoded_info.otp_id);
}

const getOTPById = async(req, res) => {
    let id = req.params.id;

    const otpResult = await pool.query(
        `SELECT * FROM otp WHERE id = $1;`,
        [id]
    );

    if (otpResult.rows.length == 0) {
        return res.status(400).send("Invalid OTP");
    };

    return res.status(200).send(otpResult.rows[0]);
};


module.exports = {
    newOTP,
    verifyOTP,
    deleteOTP,
    getOTPById
}