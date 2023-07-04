const errorHandler = async(error, res) => {
    return res.status(400).json({"message": "Serverda xatolik!"});
}

module.exports = {
    errorHandler,
}