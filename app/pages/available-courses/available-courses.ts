import { Component } from '@angular/core';
import {Page, ActionSheet, Platform, Alert, NavController} from 'ionic-angular';
import {Backend} from '../../providers/backend/backend';
import {CourseDetailsPage} from "../course-details/course-details"

@Component({
  templateUrl: 'build/pages/available-courses/available-courses.html',
})

export class AvailableCoursesPage {
  availableCourses: any[];
  constructor(public nav: NavController, public backend: Backend, public platform: Platform) {
    this.backend.availableCourses(backend.userDetails._id)
      .then(enrolledCourses => {
        this.availableCourses = enrolledCourses;
      });
  }
  viewCourse(course) {
    this.nav.push(CourseDetailsPage, { id: course._id })
  }
  enrollCourse(course) {
    var enrollPrompt = Alert.create({
      title: 'Enroll Course',
      message: "Do you want to enroll this course?",
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked', data);
          }
        },
        {
          text: 'Enroll',
          handler: data => {
            
              console.log("successfully enrolled");
              console.log(this);
     var  model= this;
     this.backend.enrollCourse(course._id).then(function () {
 alert("Successfully Enrolled");
  });
          }
        }
      ]
    });
    this.nav.present(enrollPrompt);
  }
  
  logOut() {
    this.backend.logout();
    this.nav.push(LoginPage);
    this.enrolledCourses = [];
  }
}
