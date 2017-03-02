
(function () {
    var _ = require('lodash');
    var utils = {
        dayMapping: {
            "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6
        },

        sanitizeUsers: function (users) {
            _.forEach(users, function (element) {
                _.omit(element, 'password');
            });
        },

        getIdsAfterFormating: function (userIds) {
            var ids = [];
            _.forEach(userIds, function (id) {
                ids.push("ObjectId(\"" + id + "\")");
            });
            return ids;
        },

        sendObjectInResponse: function (res, object) {
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify(object));
        },

        getCourseDatesForTimings: function (semester, timings) {
            var days = [];
            for (var i = 0; i < timings.length; i++) {
                days.push(this.dayMapping[timings[i].day]);
            }
            var date = "";
            var currentYear = new Date().getFullYear();
            var startDate = new Date(semester.startDate + " " + currentYear);
            var endDate = new Date(semester.endDate + " " + currentYear);
            var courseDates = [];
            while (startDate <= endDate) {
                if (days.indexOf(startDate.getDay()) > -1) {
                    date = "date" + (startDate.getMonth() + 1) + "_" + startDate.getDate()
                        + "_" + startDate.getFullYear();
                    courseDates.push(date);
                }
                startDate.setDate(startDate.getDate() + 1);
            }
            return courseDates;
        },

        getLocation : function() {
            var location = {};
            Geolocation.getCurrentPosition().then(function (position) {
                location.latitude = position.coords.latitude;
                location.longitude = position.coords.longitude;
            }, function (err) {
                console.log("geolocation error : ", err);
            });
            return this.professorLocation;
        },

        getDistanceBetweenTwoLocations: function (studentLocation , professorLocation) {
            var radlat1 = Math.PI * professorLocation.latitude / 180;
            var radlat2 = Math.PI * studentLocation.latitude / 180;
            var theta = professorLocation.longitude - studentLocation.longitude;
            var radtheta = Math.PI * theta / 180;
            var distance = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            distance = Math.acos(distance);
            distance = distance * 180 / Math.PI;
            distance = distance * 60 * 1.1515;
            var unit = "k";
            if (unit == "K") { 
                distance = distance * 1.609344 
            };
            if (unit == "N") {
                 distance = distance * 0.8684 
            };
                        console.log("distance :4 ", distance);
            return distance;
        }
    }
    module.exports = utils;
} ());