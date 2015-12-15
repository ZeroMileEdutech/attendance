const Bcrypt   = require('bcrypt');
const Boom     = require('boom');
const JWT      = require('jsonwebtoken');
const _        = require("lodash");

var models = require('../models');

module.exports  = exports = {
	authValidateHandler: function(decoded, request, callback) {
	    if (!decoded.username || !decoded.email || !decoded.name) {
	        return callback(null, false);
	    };

	    models.User.find({$or: [
	        {username: decoded.username},
	        {email: decoded.email}
	    ]}).then(function(user) {
	        return callback(null, true, { _id: user._id, name: user.name, email: user.email, username: user.username });
	    }).catch(function(error) {
            return callback(null, false);
	    });
	},
	loginHandler: function(request, reply) {
	    if (!request.payload.username || !request.payload.password) {
	        return reply(Boom.unauthorized("Insufficient data."));
	    };

	    models.User.findOne({where: {$or: [
	        {username: request.payload.username},
	        {email: request.payload.username}
	    ]}}).then(function(users) {
	        if (!_.isEmpty(users)) {
	            user = users.get({plain: true});
	            Bcrypt.compare(request.payload.password, user.password, (err, isValid) => {
	                if (!err && isValid === true) {
	                    var dataToSend = {
	                        username: user.username,
	                        name: user.name,
	                        email: user.email,
	                    };
	                    var token = JWT.sign(dataToSend, request.server.app.jwt_secret, { algorithms: [ 'HS256' ] });

	                    dataToSend.access_token = token;
	                    reply(dataToSend).header("Authorization", request.headers.authorization);
	                } else {
	                    return reply(Boom.unauthorized("Password does not match"));
	                }
	            });
	        } else {
	            return reply(Boom.unauthorized("Invalid credentials."));
	        }
	    }).catch(function(err) {
	    	if (err) {
	            return reply(Boom.unauthorized("Invalid credentials."));
	        };
	    });
	},
	registerHandler: function(request, reply) {
	    // Check all data are passed
	    if (!request.payload.username
	        || !request.payload.password
	        || !request.payload.email
	        || !request.payload.name
	    ) {
	        return reply(Boom.unauthorized("Insufficient data"));
	    };

	    models.User
        .findOne({where: {$or: [
            {username: request.payload.username},
            {email: request.payload.email}
        ]}})
        .then(function(existingUser) {
            if (!_.isEmpty(existingUser)) {
                return reply(Boom.conflict("Username or email already exists."));
            };

            // generate a salt
			Bcrypt.genSalt(request.server.app.password_salt_work_factor, function(err, salt) {
			    if (err) return reply(Boom.badImplementation("Encryption error."));

			    // hash the password using our new salt
			    Bcrypt.hash(request.payload.password, salt, function(err, hash) {
			    	if (err) return reply(Boom.badImplementation("Encryption error."));

			        // override the cleartext password with the hashed one
			        request.payload.password = hash;

			        // Register User
		            models.User
					.create(request.payload)
					.then(function() {
						reply(null, "Registration successful");
					})
					.catch(function(err) {
		                reply(err, null);
					})
			    });
			});

        })
        .catch(function(err) {
        	if (err) {
        		return reply(err, null);
            };
        });
	},
	test: function(request, reply) {
		reply(request.server.app);
	},
	all: function(request, reply) {
		models.User.findAll()
			.then(function(users) {
				reply(users).code(200);
			});
	},
	create: function(request, reply) {
		console.log("been here");
		models.User
		.create(request.payload)
		.then(function() {
			reply(request.payload);
		})
	},
	view: function(request, reply) {
		models.User.findById({id: request.params.id}).then(function(user) {
			reply(user);
		})
	},
	remove: function(request, reply) {
		reply(new Error('Cannot delete at the moment'));
	},
};