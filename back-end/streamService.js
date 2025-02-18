const {ServerError} = require("./errors");
const { environment} = require("./environment");
const fs = require('fs/promises');
const {insertStream, getStream, stopStream} = require("./streamAccessor");
let streamData = {};

exports.saveStreamFrame = async (file) => {
    if (!streamData.active) {
        throw new ServerError('Not existing stream', 405);
    }

    if (!file) {
        throw new ServerError('No file specified', 400);
    }

    const newPath = `${environment.streamRoot}`;

    await fs.copyFile(file.path, `${newPath}/${streamData.endPoint + 1}.ts`);

    return ++streamData.endPoint;
}

exports.getStreamFrame = async (part) => {
    if (!streamData.hasOwnProperty('endPoint')) {
        throw new ServerError('Not existing stream', 404);
    }

    let currentPart = part;

    if (!currentPart) {
        currentPart = streamData.endPoint - 2;
    }

    if (!streamData.active && currentPart > streamData.endPoint) {
        throw new ServerError('Stream was ended', 405);
    }

    return `${environment.streamRoot}/${currentPart}.ts`;
}

exports.getStreamInfo = async () => {
    if (!streamData.hasOwnProperty('endPoint')) {
        throw new ServerError('Not existing stream', 404);
    }

    const stream = await getStream();

    return {
        data: stream,
        endPoint: streamData.endPoint - 2
    }
}

exports.postStream = async (name, dateStart) => {
    if (!name) {
        throw new Error('Invalid stream data');
    }

    await insertStream(name, dateStart, true);

    streamData = {
        name,
        dateStart,
        active: 1,
        endPoint: 0
    }

    return {
        ...streamData
    }
}

exports.endStream = async () => {
    if (!streamData.active) {
        throw new ServerError('Not existing stream', 404);
    }

    streamData.active = 0;

    const result = await stopStream();

    setTimeout(async() => {
        streamData = {};
        const files = await fs.readdir(`${environment.streamRoot}`);
        files.forEach(file => fs.unlink(`${environment.streamRoot}/${file}`));
    }, 1000 * 60);

    return result;
}

exports.backupStream = async () => {
    try {
        const stream = await getStream();
        if (!stream.isActive) return;

        const endPoint = await getEndpoint();
        streamData = {
            ...stream,
            active: 1,
            endPoint
        }
    } catch (error) {
        streamData = {}
    }
}

const getEndpoint = async () => {
    const files = await fs.readdir(`${environment.streamRoot}`);

    if (files.length === 0) return 0;

    const frames = files
        .map(file => file.split('.')[0])
        .filter(string => /^\d+$/.test(string))
        .map(string => +string);
    return Math.max(...frames);
}
