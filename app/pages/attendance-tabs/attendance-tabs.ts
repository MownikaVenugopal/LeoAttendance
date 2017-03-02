import { Component } from '@angular/core';
import {Page, NavController, NavParams, Platform} from 'ionic-angular';
import {Backend} from '../../providers/backend/backend';
import * as _ from 'lodash';

@Component({
  templateUrl: 'build/pages/attendance-tabs/attendance-tabs.html',
})

export class AttendanceTabsPage {
  enrolledStudents: any[] = [];
  absentStudents: any[] = [];
  presentedStudents: any[] = [];
  students: string = 'present';
  isThereClassToday: boolean =  true;
  isAndroid: boolean = true;
  course: any;
  attendanceDate : any;
  date: any;
  constructor(public nav: NavController, public backend: Backend, public navParams: NavParams, public platform: Platform)  {
    this.isAndroid = platform.is('android'); 
    this.attendanceDate = this.navParams.get('date');
    var date = this.attendanceDate.split("_");
    this.date = date[0].split("").pop() + "/" + date[1] + "/" +date[2]
  }

  ionViewWillEnter() {
    this.backend.getCourse(this.navParams.get('id')).then(course => {
      this.course = course;
      this.attendanceDate = this.navParams.get('date');
      var attendedStudentIds = course.dateAndAttendance[this.attendanceDate];
      var absentStudentIds;
      if(!course.dateAndAttendance[this.attendanceDate]) {
          this.isThereClassToday =  false;
          return;
      }
      if (attendedStudentIds) {
        this.presentedStudents = attendedStudentIds.map(studentId => course.users[studentId]);
        absentStudentIds = _.difference(course.students, attendedStudentIds);
      } else {
        absentStudentIds = course.students;
      }
      this.absentStudents = absentStudentIds.map(studentId => course.users[studentId]);
    });
  }

  markAsPresent(student) {
      this.backend.markAttendance(this.navParams.data, student._id).then(data => {
        console.log(data);
        var index = this.absentStudents.findIndex(obj => obj._id == student._id);
        this.presentedStudents =  
        _.concat(this.presentedStudents, _.pullAt(this.absentStudents, index));
      })
  }

  markAsAbsent(student) {
    this.backend.markAsAbsent(this.navParams.data, student._id).then(course => {
        console.log(course);
       var index = this.presentedStudents.findIndex(obj => obj._id == student._id);
        this.absentStudents =  
        _.concat(this.absentStudents, _.pullAt(this.presentedStudents, index));
    })
  }  
}
