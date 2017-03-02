var restify = require('restify');
var mongojs = require('mongojs');
var morgan = require('morgan');
var ObjectId = mongojs.ObjectId;
var _ = require('lodash');
var registration = require('./registration');
var utils = require('./utils');
var professorLocation = {};
var db = mongojs('leoattendance', ['courses', 'semesters', 'appUsers']);
//var db =mongojs('mongodb://atsdbcloud:ats595@clusterleo-shard-00-00-dueqy.mongodb.net:27017,clusterleo-shard-00-01-dueqy.mongodb.net:27017,clusterleo-shard-00-02-dueqy.mongodb.net:27017/admin?ssl=true&replicaSet=Clusterleo-shard-0&authSource=admin',['appUsers','semesters','courses'])

// Server
var server = restify.createServer();
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser({ mapParams: true }));
server.use(morgan('dev')); // LOGGER

// CORS
server.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

server.listen(8888, function () {
    console.log("Server started @ 8888");
});

registration(server, db);

server.get("/professor/:id/initial/", function (req, res, next) {
    db.courses.find({ "professorID": req.params.id }, function (err, courses) {
        var courseObjectlist = {
            courses: courses,
            locations: ["Jour129", "Jour101", "Jour105", "EDS239", "EDS131","BA253"],
            semesters: ["Fall","Spring","Maymini", "Summer1","Summer2"],
            days: _.keys(utils.dayMapping)
        }
        utils.sendObjectInResponse(res, courseObjectlist);
    });
});

server.get('/enrolledCourses/:id', function (req, res, next) {
    db.courses.find({ "students": ObjectId(req.params.id) }, function (err, data) {
        utils.sendObjectInResponse(res, data);
    });
});

server.get('/availableCourses/:id', function (req, res, next) {
    db.courses.find({ "students": { $ne: ObjectId(req.params.id) } }, function (err, data) {
        utils.sendObjectInResponse(res, data);
    });
});

server.post('/course', function (req, res, next) {
    var course = JSON.parse(req.body);
    db.courses.save(course,
        function (err, data) {
            utils.sendObjectInResponse(res, data);
        });
    return next();
});

server.post('/enrollcourse/:id', function (req, res, next) {
    var studentId = JSON.parse(req.body);
    var courseId = ObjectId(req.params.id);
    db.courses.update({ _id: courseId },
        { $push: { "students": ObjectId(studentId) } },
        function (err, data) {
            db.courses.findOne(courseId, function (err, course) {
                utils.sendObjectInResponse(res, course);
            });
        });
});

server.post('/dropCourse/:id', function (req, res, next) {
    var studentId = JSON.parse(req.body);
    var courseId = ObjectId(req.params.id);
    db.courses.update({ _id: courseId },
        { $pull: { "students": ObjectId(studentId) } },
        function (err, data) {
            db.courses.findOne(courseId, function (err, course) {
                utils.sendObjectInResponse(res, course);
            });
        });
});

server.del('/course/:id', function (req, res, next) {
    db.courses.remove({
        _id: ObjectId(req.params.id)
    }, function (err, data) {
        utils.sendObjectInResponse(res, true);
    });
});

server.post('/course/:id', function (req, res, next) {
    var paramCourse = JSON.parse(req.body);
    db.courses.findOne(ObjectId(req.params.id), function (err, data) {
        var paramCourse = JSON.parse(req.body);
        delete paramCourse["_id"];
        db.courses.findAndModify({
            query: { _id: ObjectId(req.params.id) },
            update: {
                $set: {
                    name: paramCourse.name, title: paramCourse.title,
                    location: paramCourse.location, semester: paramCourse.semester
                }
            },
            new: true,
            upsert: true
        }, function (err, data) {
            utils.sendObjectInResponse(res, data);
        });
    });
});

server.get('/course/:id', function (req, res, next) {
    db.courses.findOne(ObjectId(req.params.id)
        , function (err, course) {
            utils.sendObjectInResponse(res, course);
        });
});

server.get('/course/:id/full', function (req, res, next) {
    db.courses.findOne(ObjectId(req.params.id)
        , function (err, course) {
            var userIds = _.concat(course.students, ObjectId(course.professorID));
            db.appUsers.find({ '_id': { $in: userIds } }, function (err, users) {
                utils.sanitizeUsers(users);
                var usersObj = _.reduce(users, function (accumlator, user) {
                    accumlator[user._id] = user;
                    return accumlator;
                }, {});
                course.users = usersObj;
                utils.sendObjectInResponse(res, course);
            });
        });
});

server.post("/addCourseTiming/:id", function (req, res, next) {
    var timing = JSON.parse(req.body);
    var courseId = ObjectId(req.params.id);
    db.courses.findOne({ _id: courseId },
        function (err, modifiedCourse) {
            modifiedCourse.timings.push(timing);
            modifiedCourse.timings = _.uniq(modifiedCourse.timings);
            db.semesters.findOne({ semester: modifiedCourse.semester }, function (err, semesterObject) {
                var courseDates = utils.getCourseDatesForTimings(semesterObject, modifiedCourse.timings);
                var dateAndAttendance = modifiedCourse.dateAndAttendance || {}; // this should be an object. 
                var newCourseDates = _.difference(courseDates, _.keys(dateAndAttendance));
                _.forEach(newCourseDates, function (date) {
                    dateAndAttendance[date] = [];
                });
                db.courses.update({ _id: courseId }, {
                    $set: { "dateAndAttendance": dateAndAttendance, "timings": modifiedCourse.timings }
                }, function (err, result) {
                    utils.sendObjectInResponse(res, modifiedCourse);
                });
            })
        });
})

server.post("/deleteCourseTiming/:id", function (req, res, next) {
    var timing = JSON.parse(req.body);
    var courseId = ObjectId(req.params.id);
    db.courses.findOne({ _id: courseId },
        function (err, modifiedCourse) {
            _.remove(modifiedCourse.timings, timing);
            db.semesters.findOne({ semester: modifiedCourse.semester }, function (err, semesterObject) {
                var courseDates = utils.getCourseDatesForTimings(semesterObject, modifiedCourse.timings);
                var dateAndAttendance = modifiedCourse.dateAndAttendance;
                var deletedCourseDates = _.difference(_.keys(dateAndAttendance), courseDates);
                dateAndAttendance = _.omit((dateAndAttendance), deletedCourseDates);
                modifiedCourse.dateAndAttendance = dateAndAttendance;
                db.courses.update({ _id: courseId }, {
                    $set: { "dateAndAttendance": dateAndAttendance, "timings": modifiedCourse.timings }
                }, function (err, result) {
                    utils.sendObjectInResponse(res, modifiedCourse);
                });
            });
        });
});

server.post('/setProfessorLocation/:id', function (req, res, next) {
    var location = JSON.parse(req.body);
    var courseId = ObjectId(req.params.id);
    db.courses.findOne({ _id: courseId }, function (err, course) {
        db.courses.update({ _id: courseId }, {
            $set: { "professorLocation": location }
        }, function (err, result) {
            utils.sendObjectInResponse(res, result);
        })
    })
})


server.post('/markAsAbsent/:id', function (req, res, next) {
    var studentId = req.body;
    var courseId = ObjectId(req.params.id);
    var date = new Date();
    var todayDate = "date" + (date.getMonth() + 1) + "_" + date.getDate() + "_" + date.getFullYear();
    var attendanceDate = "dateAndAttendance." + todayDate;
    var data = {};
    data[attendanceDate] = ObjectId(studentId);
    db.courses.update({ _id: ObjectId(req.params.id) },
        { $pull: data },
        function (err, data) {
            db.courses.findOne(ObjectId(req.params.id), function (err, modifiedCourse) {
                console.log(modifiedCourse);
                utils.sendObjectInResponse(res, modifiedCourse);
            })
        })
})



server.post('/markAttendance/:id', function (req, res, next) {
    var requestDetails = JSON.parse(req.body);
    var studentId = requestDetails.studentId;
    var courseId = ObjectId(req.params.id);
    var date = new Date();
    var todayDate = "date" + (date.getMonth() + 1) + "_" + date.getDate() + "_" + date.getFullYear();
    var attendanceDate = "dateAndAttendance." + todayDate;
    var data = {};
    data[attendanceDate] = ObjectId(studentId);
    db.courses.findOne({ _id: courseId }, function (err, course) {
        var distance = utils.getDistanceBetweenTwoLocations(course.professorLocation, requestDetails.studentLocation);
        if (parseInt(distance) <= 0.1) {
            db.courses.update({ _id: ObjectId(req.params.id) },
                { $push: data },
                function (err, data) {
                    db.courses.findOne(ObjectId(req.params.id), function (err, modifiedCourse) {
                        console.log(modifiedCourse);
                        utils.sendObjectInResponse(res, modifiedCourse);
                    })
                });
        }
    })
});

module.exports = server;