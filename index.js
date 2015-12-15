const Hapi = require("hapi");

const models    = require("./models");
const env       = process.env.NODE_ENV || 'development';
const config    = require(__dirname + '/config/config.json')[env];
const usersCtrl = require("./controllers/users");

// Configure server
const server = new Hapi.Server();
server.connection({
	host: config.host,
	port: config.port,
})
server.app = config;


// Plugins
var plugins = [];
plugins.push({
    register: require('good'),
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                log: '*',
                response: '*',
                ops: '*'
            }
        }]
    }
});

// Authentication Plugin
plugins.push({
    register: require('hapi-auth-jwt2')
});

// Register all plugins and start server
models.sequelize.sync().then(function() {
	server.register(plugins, error => {
		if (error) {
			throw err;
		} else {
			server.auth.strategy('jwt', 'jwt', {
	            key: config.jwt_secret,
	            validateFunc: usersCtrl.authValidateHandler,
	            verifyOptions: { algorithms: [ 'HS256' ] }
	        });
	        server.auth.default('jwt');

	        // Routes
			server.route(require("./routes"));

			// Start Server
			server.start(() => {
				console.log("Hapi server running at ", server.info.uri);
			});
		}
	});
});