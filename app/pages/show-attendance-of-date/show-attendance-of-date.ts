import { Component } from '@angular/core';
import {Page, NavController, NavParams} from 'ionic-angular';
import {Backend} from '../../providers/backend/backend';
import {AttendanceTabsPage}
@Component({
  templateUrl: 'build/pages/show-attendance-of-date/show-attendance-of-date.html',
})
export class ShowAttendanceOfDatePage {
  courseId : any;
  courseDate : any;
  courseDateAfterFormat : any;
  presentedStudents: any[] = [];
  monthNames: any[] = [];
  constructor(public nav: NavController, public backend: Backend, public navParams: NavParams) {
    this.monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    this.courseId = this.navParams.get('id');
    this.courseDate = this.navParams.get('date');
     var date = this.courseDate.split("_");
    this.courseDateAfterFormat =  this.monthNames[parseInt(date[0].split("").pop()) - 1] + " " +  date[1] + " " +date[2];
  }
  ionViewWillEnter() {
    if (this.courseId != undefined) {
      this.backend.getCourse( this.courseId).then(course => {
        if(course.dateAndAttendance[this.courseDate] != undefined){
            this.presentedStudents = course.dateAndAttendance[this.courseDate];
        }
      });
    }
  }
}
