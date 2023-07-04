const { Router } = require("express");
const {
    addNewClient,
    getAllClients,
    updateClientById,
} = require("../controllers/client.controllers.js");

const router = Router();

router.get("/", getAllClients);
router.post("/", addNewClient);
router.put("/:id", updateClientById);

module.exports = router;
