import {Injectable} from '@angular/core';
import { Events } from 'ionic-angular';
import {Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import {Geolocation} from 'ionic-native'

@Injectable()
export class Backend {
  courses: any[] = [];
  available: any[] = [];
  enrolled: any[] = [];
  courseById = {}
  studentEnrolledForClass: any[] = [];
  locations: string[] = [];
  timings: any[] = [];
  semesters: string[] = [];
  days: string[] = [];
  initialized: boolean = false;
  courseDates = {};
  location = {};
  userDetails: any = null;
  ipAddress: any = "";
  BASE_URL: string = "http://localhost:8888/";
  constructor(public http: Http, public events: Events) {
    this.userDetails = JSON.parse(localStorage.getItem("userObject"));
  }

  __addOrUpdateCourse(course: any) {
    if (this.courseById[course._id]) {
      this.__removeCourse(course._id);
    }

    console.log("time"+course.coureTimings);
    this.courses.push(course);
    this.courseById[course._id] = course;
  }

  __removeCourse(id: string) {
    var course = this.courseById[id];
    var index = this.courses.indexOf(course, 0);
    if (index > -1) {
      this.courses.splice(index, 1);
    }
  }

  _removeEnrolledCourse(id) {
    var index = this.enrolled.map(function (x) { return x._id; }).indexOf(id);
    if (index > -1) {
      this.enrolled.splice(index, 1);
    }
  }

  _removeAvailableCourse(id) {
    var index = this.available.map(function (x) { return x._id; }).indexOf(id);
    if (index > -1) {
      this.available.splice(index, 1);
    }
  }

  _addEnrolledCourses(course) {
    this.enrolled.push(course);
  }

  _addAvailableCourses(course) {
    this.available.push(course);
  }

  initialize(userId) {
    if (this.initialized) {
      return Promise.resolve(true);
    }

    return new Promise(resolve => {
      this.http.get(this.BASE_URL + "professor/" + userId + "/initial")
        .map(res => res.json())
        .subscribe(data => {
          this.initialized = true;
          for (var course of data.courses) {
            this.__addOrUpdateCourse(course);
          }
          this.locations = data.locations;
          this.semesters = data.semesters;
          this.days = data.days;
          resolve(true);
        });
    });
  }


  loadLocations() {
    return Promise.resolve(this.locations);
  }

  loadsemesters() {
    return Promise.resolve(this.semesters);
  }

  loadDays() {
    return Promise.resolve(this.days);
  }

  loadCourses(userId): Promise<any[]> {
    if (this.initialized) {
      return Promise.resolve(this.courses);
    }
    return new Promise<any[]>(resolve => {
      this.http.get(this.BASE_URL + "professor/" + userId + "/courses")
        .map(res => res.json())
        .subscribe(data => {
          for (var course of data) {
            this.__addOrUpdateCourse(course);

          }
          resolve(this.courses);
        });
    });
  }

  availableCourses(userId): Promise<any[]> {
    return new Promise<any[]>(resolve => {
      this.http.get(this.BASE_URL + "availableCourses/" + userId)
        .map(res => res.json())
        .subscribe(data => {
          for (var course of data) {
            this._addAvailableCourses(course);
          }
          resolve(this.available);
        });
    });
  }

  enrolledCourses(userId): Promise<any[]> {
    return new Promise<any[]>(resolve => {
      this.http.get(this.BASE_URL + "enrolledCourses/" + userId)
        .map(res => res.json())
        .subscribe(data => {
          for (var course of data) {
            this._addEnrolledCourses(course);
          }
          resolve(this.enrolled);
        });
    });
  }

  getCourse(courseId: string) {
    return this.getCourseForced(courseId, false);
  }

  getCourseForced(courseId: string, forced: Boolean) {
    if (!forced && this.courses.length != 0) {
      for (var course of this.courses) {
        if (course._id == courseId) {
          return Promise.resolve(course);
        }
      }
    }
    return new Promise(resolve => {
      this.http.get(this.BASE_URL + "course/" + courseId + "/full")
        .map(res => res.json())
        .subscribe(data => {
          this.__addOrUpdateCourse(data);
          resolve(data);
        });
    });
  }

  updateCourse(course) {
    var courseJson = JSON.stringify(course);
    var headers = new Headers({ 'Content-Type': 'application/json' });
    var options = new RequestOptions({ headers: headers });
    var URL = this.BASE_URL + "course"
    if (course._id) {
      URL = URL + "/" + course._id;
    }
    return new Promise(resolve => {
      this.http.post(URL, courseJson)
        .map(res => res.json())
        .subscribe(data => {
          this.__addOrUpdateCourse(data);
          resolve(data._id);
        });
    });
  }

  enrollCourse(course_id) {
    var studentId = JSON.stringify(this.userDetails._id);
    var headers = new Headers({ 'Content-Type': 'application/json' });
    var options = new RequestOptions({ headers: headers });
    return new Promise(resolve => {
      this.http.post(this.BASE_URL + "enrollcourse/" + course_id, studentId)
        .map(res => res.json())
        .subscribe(data => {
          this._addEnrolledCourses(data);
          this._removeAvailableCourse(data._id);
          resolve(data);
        });
    });
  }

  dropCourse(course_id) {
    var studentId = JSON.stringify(this.userDetails._id);
    var headers = new Headers({ 'Content-Type': 'application/json' });
    var options = new RequestOptions({ headers: headers });
    return new Promise(resolve => {
      this.http.post(this.BASE_URL + "dropCourse/" + course_id, studentId)
        .map(res => res.json())
        .subscribe(data => {
          this._addAvailableCourses(data);
          this._removeEnrolledCourse(data._id);
          resolve(data);
        });
    });
  }

  deleteCourse(id) {
    var headers = new Headers({ 'Content-Type': 'application/json' });
    var options = new RequestOptions({ headers: headers });
    return new Promise(resolve => {
      this.http.delete(this.BASE_URL + "course/" + id)
        .subscribe(data => {
          this.__removeCourse(id);
          resolve(data);
        });
    });
  }

  registerUser(user) {
    var userJson = JSON.stringify(user);
    console.log('aaaa');
    return new Promise(resolve => {
      this.http.post(this.BASE_URL + "register", userJson)
        .map(res => res.json())
        .subscribe(data => {
          resolve(true);
        });
    });
  }

  loginUser(user) {
    var userJson = JSON.stringify(user);
    return new Promise(resolve => {
      this.http.post(this.BASE_URL + "login/" + user.email, userJson)
        .map(res => res.json())
        .subscribe(data => {
          this.userDetails = data;
          var userObject = JSON.stringify(data);
          localStorage.setItem("userObject", userObject);
          resolve(true);
          this.events.publish('user:loggedin', this.userDetails);
        },error=>{
          this.events.publish('user:log', "invaliduser");
        })
    });
  }

  logout() {
    this.userDetails = null;
    localStorage.removeItem("email");
    localStorage.removeItem("userObject");
  }

  searchCourses(searchQuery: string) {
    return new Promise(resolve => {
      this.http.get(this.BASE_URL + "course.php?q=" + searchQuery)
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  getCourseTiming(coureTimings) {
    var dayMapping = {
      "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6
    }
    for (var i = 0; i < coureTimings.length; i++) {
      if (dayMapping[coureTimings[i].day] = (new Date()).getDay()) {
        return coureTimings[i];
      }
    }
  }

  addTiming(course_id, timeObject) {
   // var timeData = JSON.stringify(timeObject);
    console.log(JSON.stringify(timeObject));//
   // data.timings=(JSON.stringify(timeObject));
    return new Promise<any[]>(resolve => {
      this.http.post(this.BASE_URL + "addCourseTiming/" + course_id, JSON.stringify(timeObject))
        .map(res => res.json())
         .subscribe(data => {
           
          this.__addOrUpdateCourse(data);
          resolve(this.courseById[course_id]);
        });
    });
  }

  deleteTiming(course_id, timing) {
    var timeData = JSON.stringify(timing)
    return new Promise<any[]>(resolve => {
      this.http.post(this.BASE_URL + "deleteCourseTiming/" + course_id, timeData)
        .map(res => res.json())
        .subscribe(data => {
          this.__addOrUpdateCourse(data);
          resolve(this.courseById[course_id]);
        })
    })
  }

  markAsAbsent(courseId, studentId) {
    return new Promise(resolve => {
      this.http.post(this.BASE_URL + "markAsAbsent/" + courseId, studentId)
        .map(res => res.json())
        .subscribe(modifiedAttendance => {
          this.__addOrUpdateCourse(modifiedAttendance);
          resolve(modifiedAttendance);
        });
    });
  }

  getLocation() {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition().then(function(position){
          var location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          resolve(location);
          })
      });
  }

  setLocation(location, course_id) {
    var professorLocation = JSON.stringify(location);
    return new Promise(resolve => {
      this.http.post(this.BASE_URL + "setProfessorLocation/" +course_id , professorLocation)
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      })
    })
  }

  markAttendance(courseId, studentLocation) {
    var details = {
      studentLocation: studentLocation,
      studentId: this.userDetails._id
    }
    return new Promise(resolve => {
      this.http.post(this.BASE_URL + "markAttendance/" +courseId, JSON.stringify(details))
        .map(res => res.json())
        .subscribe(modifiedAttendance => {
          this.__addOrUpdateCourse(modifiedAttendance);
          resolve(modifiedAttendance);
        });
    });
  }
}

