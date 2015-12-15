"use strict";
module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        username: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true
            }
        },
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        name: DataTypes.STRING,
    }, {
        classMethods: {
            associate: function(models) {
                // User.hasMany(models.Post);
            }
        }
    }, {
        indexes: [
            {unique: true, fiels: ['email', 'username']}
        ]
    });
    return User;
};