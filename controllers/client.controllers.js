const pool = require("../config/db.js");

const { errorHandler } = require("../helpers/error_handler")

const getAllClients = async(req, res) => {
    try {
        const clients = await pool.query(`SELECT * FROM client`);
        return res.status(200).json(clients.rows);
    } catch (error) {
        errorHandler(error, res);
    }
}


const addNewClient = async(req, res) => {
    try {
        const {
            client_last_name,
            client_first_name,
            client_phone_number,
            client_info,
            client_photo,
        } = req.body
        const newClient = await pool.query(
            `INSERT INTO client(client_last_name, client_first_name, client_phone_number, client_info, client_photo) VALUES($1, $2, $3, $4, $5) RETURNING *`,
            [
                client_last_name,
                client_first_name,
                client_phone_number,
                client_info,
                client_photo,
            ]
            );

            return res.status(201).json(newClient.rows[0]);
    } catch (error) {
        errorHandler(error, res);
    }
}

const updateClientById = async(req, res) => {
    try {
        const id = req.params.id

        const {
            client_last_name,
            client_first_name,
            client_phone_number,
            client_info,
            client_photo,
        } = req.body

        const updateClient = await pool.query(
            `UPDATE client set client_last_name=$1, client_first_name=$2,
                client_phone_number=$3, client_info=$4, client_photo=$5
                WHERE id=$6 RETURNING *`,
            [
                client_last_name,
                client_first_name,
                client_phone_number,
                client_info,
                client_photo,
                id,
            ]
        );

        if (updateClient.rowCount === 0) {
            return res.status(404).send('Client not found');
        }

        return res.status(200).send(updateClient.rows[0]);
    } catch (error) {
        errorHandler(error, res);
    }
};

module.exports = {
    getAllClients,
    addNewClient,
    updateClientById
}