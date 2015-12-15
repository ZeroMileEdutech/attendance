var controllers = require('../controllers');

module.exports = [
	{
		method: 'GET',
		path: '/',
		handler: controllers.users.test
	},
	{
		method: 'GET',
		path: '/users',
        config: { auth: 'jwt', cors: true },
		handler: controllers.users.all
	},
	{
		method: 'GET',
		path: '/users/:id',
        config: { auth: 'jwt', cors: true },
		handler: controllers.users.view
	},
    {
        method: 'POST',
        path: '/login',
        config: { auth: false, cors: true },
        handler: controllers.users.loginHandler
    },
    {
        method: 'POST',
        path: '/register',
        config: { auth: false, cors: true },
        handler: controllers.users.registerHandler
    }
];