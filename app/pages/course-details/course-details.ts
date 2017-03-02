import { Component } from '@angular/core';
import {Page, NavParams, NavController, Platform} from 'ionic-angular';
import {Geolocation} from 'ionic-native'
import {AddEditCoursePage} from '../add-edit-course/add-edit-course';
import {Backend} from '../../providers/backend/backend';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass} from '@angular/common';
import {AttendanceTabsPage} from '../attendance-tabs/attendance-tabs';
import {PreviousAttendanceDatesPage} from '../previous-attendance-dates/previous-attendance-dates';
import { ChartsModule } from 'ng2-charts/ng2-charts';


@Component({
  templateUrl: 'build/pages/course-details/course-details.html',
  directives: [NgClass, CORE_DIRECTIVES, FORM_DIRECTIVES]
})

export class CourseDetailsPage {
  absentStudentsCount: any;
  presentStudentsCount: any;
  public chartLabels: string[] = ['Present Students', 'Absent Students'];
  chartData: number[] = [];
  public chartType: string = 'doughnut';
  course: any;
  enrolledStudents: any[] = [];
  professor: any;
  isProfessor : boolean;
  courseId: any;
  attendanceDate: any;
  constructor(public nav: NavController, public backend: Backend, public navParams: NavParams, public platform: Platform) {
    this.course = {};
    this.professor = {};
    this.courseId = this.navParams.get('id');
    var date = new Date();
    this.attendanceDate = "date" + (date.getMonth() + 1) + "_" + date.getDate() + "_" + date.getFullYear();
    
  }
  public chartClicked(e: any): void {
  }
  public chartHovered(e: any): void {
  }

  editClass() {
    this.nav.push(AddEditCoursePage, { id: this.course._id });
  }

  ionViewWillEnter() {
    this.isProfessor = this.backend.userDetails.isProfessor;
    if (this.courseId != undefined) {
      this.backend.getCourseForced(this.courseId, true).then(course => {
        this.professor = course.users[course.professorID];
        this.enrolledStudents = course.students.map(studentId => course.users[studentId]);
        this.course = course;
      });
    }
  }

  showTodayAttendance() {
    this.nav.push(AttendanceTabsPage, { id: this.course._id, date : this.attendanceDate});
  }

  showPreviousAttendance() {
    this.nav.push(PreviousAttendanceDatesPage, { id: this.course._id });
  }
}
