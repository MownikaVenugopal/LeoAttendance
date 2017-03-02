import { Component } from '@angular/core';
import {Page, ActionSheet, Platform, Alert, NavController, Loading} from 'ionic-angular';
import {LoginPage} from "../login/login"
import {Backend} from '../../providers/backend/backend';
import {CourseDetailsPage} from '../course-details/course-details';

@Component({
  templateUrl: 'build/pages/enrolled-courses/enrolled-courses.html',
})

export class EnrolledCoursesPage {
  enrolledCourses: any[];
  courseTimings: any[];
  studentData: any;
  constructor(public nav: NavController, public platform: Platform, public backend: Backend) {
    this.backend.enrolledCourses(this.backend.userDetails._id)
      .then(enrolledCourses => {
        this.enrolledCourses = enrolledCourses;
        console.log("reaching here : -1", this.enrolledCourses);
        this.studentData = this.backend.userDetails;
        var date = new Date();
        var todayDate = "date" + (date.getMonth() + 1) + "_" + date.getDate() + "_" + date.getFullYear();
        for (var course of this.enrolledCourses) {
          course.markAttendanceButton = false;
          if (course.dateAndAttendance[todayDate] != undefined) {
            this.courseTimings = course.timings;
            var data = this.backend.getCourseTiming(this.courseTimings);
            var startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
              data.startTime.split(":")[0], data.startTime.split(":")[1]);
            var endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
              data.endTime.split(":")[0], data.endTime.split(":")[1]);
            if ((new Date()).getTime() >= startTime.getTime() && (new Date()).getTime() < endTime.getTime()) {
              if (course.dateAndAttendance[todayDate].length == 0) {
                course.markAttendanceButton = false;
              }
              for (var i = 0; i < course.dateAndAttendance[todayDate].length; i++) {
                console.log(course.dateAndAttendance[todayDate][i], this.studentData._id);
                if (course.dateAndAttendance[todayDate][i] == this.studentData._id) {
                  
                  course.markAttendanceButton = true;
                  break;
                } else {
                  course.markAttendanceButton = false;
                }
              }
            } else {
              course.markAttendanceButton = false;
            }
          }
        }
      });
  }

  ionViewWillEnter() {

  }

  viewCourse(course) {
    this.nav.push(CourseDetailsPage, { id: course._id })
  }

  dropCourse(course) {
    let dropConfirm = Alert.create({
      title: 'Drop Course',
      message: 'Are you sure you want to drop this class?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Drop',
          handler: () => {
            this.backend.dropCourse(course._id).then(function () {
              console.log("successfully dropped");
               alert("Successfully Dropped");
            });
          }
        }
      ]
    });
    this.nav.present(dropConfirm);
  }

  markAttendance(course) {
    let loading = Loading.create({
      content: 'Please wait...'
    });
    this.nav.present(loading);
    var userDetails = this.backend.userDetails;
    this.backend.getLocation().then(location => {
      this.backend.markAttendance(course._id, location).then(data => {
        setTimeout(() => {
          loading.dismiss();
        });
        let alert = Alert.create({
          title: "Hi " + userDetails.name + "!",
          subTitle: "Your attendance has recorded successfully!",
          buttons: ['OK']
        });
        this.nav.present(alert);
        
        course.markAttendanceButton = false;
      });
    })
  }

  logOut() {
    this.backend.logout();
    this.nav.push(LoginPage);
    this.enrolledCourses = [];
  }
}