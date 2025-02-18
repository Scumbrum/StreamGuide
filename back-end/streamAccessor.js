const fs = require('fs/promises');
const {environment} = require("./environment");

exports.getStream = () => {
    return readStreamsFile();
}

exports.insertStream = async (name, dateStart, isActive) => {
    const data = {
        name,
        dateStart,
        isActive,
    }

    await updateStreamsFile(data);

    return data;
}

exports.stopStream = async () => {
    const data = await readStreamsFile();

    data.isActive = false;

    await updateStreamsFile(data);

    return data;
}


const readStreamsFile = async() => {
    const data = await fs.readFile(`${environment.dbFile}`, 'utf8');

    return JSON.parse(data);
}

const updateStreamsFile = async (data) => {
    await fs.writeFile(`${environment.dbFile}`, JSON.stringify(data), 'utf8');
}
