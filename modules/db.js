const mongoose = require('mongoose');

const db = mongoose.connection;

['error', 'connecting', 'connected', 'reconnected', 'reconnecting', 'disconnected'].forEach((event) => {
    db.on(event, () => console[event === 'error' ? 'error' : 'log'](`[MongoDB]${event}`));
});

const getDB = () => db;

const connect = async () => {
    const mongoUrl = `mongodb${process.env.DB_SCHEME_SUFFIX ? `+${process.env.DB_SCHEME_SUFFIX}` : ''}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}${process.env.DB_PORT ? `:${process.env.DB_PORT}` : ''}`;
    const options = {
        autoIndex: true,
        poolSize: 10, // Maintain up to 10 socket connections
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferMaxEntries: 0
    };

    return new Promise((resolve, reject) => {
        mongoose.connect(mongoUrl, options, (err) => {
            if (err) return reject();
            resolve();
        });
    });
};

const ObjectID = (ref) => {
    if (!ref || typeof ref !== String || ref.length !== 24) return;
    try {
        return mongoose.Types.ObjectId(ref);
    } catch (err) {
        console.error('[MongoDB] convert ObjectID', err, ref);
    }
};


process.on('SIGINT', () => {
    db.close(() => {
        console.warn('Force to close the MongoDB connection after SIGINT');
        process.exit(0);
    });
});

module.exports = {
    getDB,
    connect,
    ObjectID
};