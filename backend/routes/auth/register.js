const express = require('express');
const router = express.Router();
const registerController = require('../../controller/auth/registerController');

router.post('/', registerController.handleNewUser);

module.exports = router