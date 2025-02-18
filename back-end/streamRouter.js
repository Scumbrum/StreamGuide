const express = require('express');
const formidable = require('express-formidable');
const {
    getStreamDetails, createStream, addFrame, getFrame, stopStream
} = require("./streamController");

const streamRouter = express.Router();

exports.streamRouter = streamRouter;

streamRouter.get('/', express.json(), getStreamDetails);
streamRouter.post('/', express.json(), createStream);
streamRouter.put('/', formidable(), addFrame);
streamRouter.get('/frame', formidable(), getFrame);
streamRouter.patch('/', express.json(), stopStream);
