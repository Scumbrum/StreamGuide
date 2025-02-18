const {
    getStreamFrame,
    saveStreamFrame,
    endStream,
    postStream,
    getStreamInfo
} = require("./streamService");

exports.getStreamDetails = async (req, res, next) => {
    try {
        const stream = await getStreamInfo();

        if(!stream) {
            return res.status(404).json({ message: 'Stream not found' });
        }

        return res.status(200).json(stream);
    } catch (err) {
        req.errorMessage = err.message;
        req.status = err.status;
        return next();
    }
}

exports.createStream = async (req, res, next) => {
    const {
        name,
        dateStart
    } = req.body;

    try {
        const stream = await postStream(name, dateStart);
        return res.json(stream);
    } catch(err) {
        req.errorMessage = err.message;
        return next();
    }
}

exports.stopStream = async (req, res, next) => {
    try {
        const stream = await endStream()
        return res.json(stream);
    } catch(err) {
        req.errorMessage = err.message;
        req.status = err.status;
        return next();
    }
}

exports.addFrame = async (req, res, next) => {
    try {
        const partNumber = await saveStreamFrame(req.files['file']);
        return res.json({ partNumber });
    } catch(err) {
        req.errorMessage = err.message;
        req.status = err.status;
        return next();
    }
}

exports.getFrame = async (req, res, next) => {
    const {
        part
    } = req.query;

    try {
        const path = await getStreamFrame(part);
        return res.sendFile(path, { root: __dirname });
    } catch(err) {
        req.errorMessage = err.message;
        req.status = err.status;
        return next();
    }
}
