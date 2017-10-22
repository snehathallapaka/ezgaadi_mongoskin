var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('analytics');

var service = {};

service.getById = getById;
service.create = create;
service.delete = _delete;

module.exports = service;

function getById(_id) {
    var deferred = Q.defer();
    db.analytics.findById(_id, function (err, analytics) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return analytics
            deferred.resolve(analytics);
        } else {
            // analytics not found
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function create(req, systemAction, attrs) {
    var deferred = Q.defer();
    var analytics = {};
    analytics.remoteAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    analytics.action = systemAction;
    analytics.createdAt= analytics.updatedAt = new Date();
    analytics.attrs = attrs;
    db.analytics.insert(
        analytics,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });
    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();
    db.analytics.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}