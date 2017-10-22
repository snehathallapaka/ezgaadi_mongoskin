var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');

var analyticsService = require('./analytics.service');
var systemAction = require('../constants/system.action');

var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('account');

var service = {};

service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;


function getById(_id) {
    var deferred = Q.defer();
    db.account.findById(_id, function (err, account) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (account) {
            // return user (without hashed password)
            deferred.resolve(account);
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function createAccount(accountParam) {
    var deferred = Q.defer();

    // validation
    db.accountParam.findOne(
        { name: accountParam.name},
        function (err, account) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (account) {
                // username already exists
                deferred.reject('Account "' + accountParam.name + '" is already taken");
            } else {
                createAccount();
            }
        });

    function createAccount() {
        // set user object to userParam without the cleartext password
        db.account.insert(
            accountParam,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            });
    }
    return deferred.promise;
}

function update(_id, account) {
    var deferred = Q.defer();
    // validation
    db.account.findById(_id, function (err, account) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (account.name !== account.name) {
            // username has changed so check if the new username is already taken
            db.account.findOne(
                { name: account.name },
                function (err, account) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
                    if (account) {
                        deferred.reject('Account "' + account.name + '" is already taken')
                    } else {
                        updateAccount();
                    }
                });
        } else {
            updateAccount();
        }
    });

    function updateAccount() {
        // fields to update
        var set = {
            name:account.name,
        };
        db.account.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            });
    }
    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.account.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}