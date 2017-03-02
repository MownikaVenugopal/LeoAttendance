(function () {
    var pwdMgr = require('../auth/managePasswords');
    var _ = require('lodash');
    var mongojs = require('mongojs');
    var ObjectId = mongojs.ObjectId;

    var registration = function (server, db) {
        server.post('/login/:email', function (req, res, next) {
            var user = JSON.parse(req.body);
            db.appUsers.findOne({
                email: req.params.email
            }, function (err, dbUser) {
                pwdMgr.comparePassword(user.password, dbUser.password, function (err, isPasswordMatch) {
                    if (isPasswordMatch) {
                        res.writeHead(200, {
                            'Content-Type': 'application/json; charset=utf-8'
                        });
                        console.log("reaching registration");
                        delete dbUser.password;
                        res.end(JSON.stringify(dbUser));
                    } else {
                        res.writeHead(403, {
                            'Content-Type': 'application/json; charset=utf-8'
                        });
                        res.end(JSON.stringify("Invalid User"));
                    }

                });
            });
        });

        server.post('/register', function (req, res, next) {
            var user = JSON.parse(req.body);
            pwdMgr.cryptPassword(user.password, function (err, hash) {
                user.password = hash;
                db.appUsers.insert(user,
                    function (err, dbUser) {
                        if (err) {
                            if (err.code == 11000) {
                                res.writeHead(400, {
                                    'Content-Type': 'application/json; charset=utf-8'
                                });
                                res.end(JSON.stringify({
                                    error: err,
                                    message: "A user with this email already exists"
                                }));
                            }
                        } else {
                            res.writeHead(200, {
                                'Content-Type': 'application/json; charset=utf-8'
                            });
                            dbUser.password = "";
                            res.end(JSON.stringify(dbUser));
                        }
                    });
            });
        });
    }
    module.exports = registration;
} ());