'use strict';

                    require(__dirname + '/lib/prototype.js'); // load prototypes

const config        = require(__dirname + '/config/config.js');
const database      = require(__dirname + '/lib/database.js');
const router        = require(__dirname + '/lib/router.js');
const auth          = require(__dirname + '/lib/auth.js');
const cors          = require(__dirname + '/lib/cors.js');
const pjson         = require(__dirname + '/package.json');

const morgan        = require('morgan');
const bodyParser    = require('body-parser');
const express       = require('express');
const app           = express();
const http          = require('http');
const https         = require('https');

const serverConf    = config.serverConfig;
const cert          = config.certificate;

module.exports = start();

function start() {

    process.setMaxListeners(0);

    const hasSSLCert    = (cert.key && cert.file);
    const server        = hasSSLCert ? https.Server(cert, app) : http.Server(app);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('.'));
    app.use(morgan('dev'));
    app.use(cors(config.cors));

    /**
     * @api {get} / Server information
     * @apiName GetServerInfo
     * @apiGroup Server
     */
    app.get('/', (req, res) => {
        res.status(200)
        .send({
            version: pjson.version,
            message: 'Welcome to FBS API',
            docs: 'https://documenter.getpostman.com/view/3554620/SzmZdg4o?version=latest'
        })
        .end();
    });

    router(app, database, auth);

    // handles unknown routes
    app.all('*', (req, res, next) => {

        if (req.method !== 'OPTIONS') {
            res.status(404)
               .send({ message: 'Nothing to do here.' });
        }

        next();
    });

    server.listen(process.env.PORT || serverConf.port, () => {
        console.log(
            `\nListening on port: ${serverConf.port}\nRunning on ${hasSSLCert ? 'https' : 'http'} connection\nApp Version: ${pjson.version}\n`
        );
    });

    return app;
}