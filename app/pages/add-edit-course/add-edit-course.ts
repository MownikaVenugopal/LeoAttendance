import { Component } from '@angular/core';
import {Page, NavController, NavParams, Loading} from 'ionic-angular';
import {Backend} from '../../providers/backend/backend';


@Component({
  templateUrl: 'build/pages/add-edit-course/add-edit-course.html',
})

export class AddEditCoursePage {
  course: any;
  locations: any;
  semesters: any;
  days: any;
  day: any;
  startTime: any;
  endTime: any;
  myDate: any;
  selectedLocation: string;
  courseId: any;
  courseDates: any;
  markAttendanceButton : any;
  constructor(public nav: NavController, public backend: Backend, public navParams: NavParams) {
    this.course = {};
    this.day = "";
    this.startTime = "";
    this.endTime = "";
    this.myDate = "";
    this.courseId = this.navParams.get('id');
    this.course.professorID = this.backend.userDetails._id;
    this.course.students = [];
    this.course.timings = [];
    this.course.dateAndAttendance = {};
    this.course.markAttendanceButton = true;
    this.backend.loadLocations().then(locations => {
      this.locations = locations;
    });
    this.backend.loadsemesters().then(semesters => {
      this.semesters = semesters;
    });
    this.backend.loadDays().then(days => {
      this.days = days;
    });
    if (this.courseId != undefined) {
      backend.getCourse(this.courseId).then(course => {
        this.course = Object.assign({}, course);
      });
    }
  }
  
  addTiming() {
    var timeObject = {
      day: this.day,
      startTime: this.startTime,
      endTime: this.endTime
    }
    this.backend.addTiming(this.courseId, timeObject).then(data => { 
      console.log("succesfully added ", data);     
      this.course = data;
    });
  }

  deleteTiming(timing) {
    this.backend.deleteTiming(this.courseId, timing).then(data => {
      this.course = data;
    })
  }
  
  updateClass() {
    let loading = Loading.create({
      content: 'Please wait...'
    });
    this.nav.present(loading);
    var self = this;
      this.backend.updateCourse(this.course).then(id => {
       this.courseId=id;
       this.addTiming();
        setTimeout(() => {
          loading.dismiss();
        });
   //     self.nav.pop(self);
      })
  }
}

