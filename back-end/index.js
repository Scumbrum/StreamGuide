const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const { streamRouter } = require('./streamRouter');
const {environment} = require("./environment");
const {backupStream} = require("./streamService");

const app = express();

app.use(cors());

app.use('/stream', streamRouter);

app.use((err, res) => {
    res.status(err.status || 500).json({ message: err.errorMessage || 'Server error' })
})

async function startServer() {
    const port = process.env.PORT || 4000;

    try {
        await fs.access(`${environment.streamRoot}`);
    } catch (err) {
        await fs.mkdir(`${environment.streamRoot}`);
    }
    await backupStream();
    app.listen(port, () => console.log(`Listening on port ${port}`));
}

startServer();
