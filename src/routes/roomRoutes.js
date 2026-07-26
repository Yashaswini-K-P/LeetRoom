const express = require("express");
const router = express.Router();
const { createRoom, checkRoom } = require("../controllers/roomController.js");

router.post("/create", createRoom);
router.get("/check/:roomCode", checkRoom);

module.exports = router;
