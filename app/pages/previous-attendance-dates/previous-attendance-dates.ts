import { Component } from '@angular/core';
import {Page, NavController, NavParams} from 'ionic-angular';
import {Backend} from '../../providers/backend/backend';
import {AttendanceTabsPage} from '../attendance-tabs/attendance-tabs';

@Component({
  templateUrl: 'build/pages/previous-attendance-dates/previous-attendance-dates.html',
})
export class PreviousAttendanceDatesPage {
  courseId : any;
  courseDates: any[] = [];
  monthNames: any[] = [];
  constructor(public nav: NavController , public backend: Backend, public navParams: NavParams) {
    this.courseId = this.navParams.get('id');
    this.monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }
  ionViewWillEnter() {
    var date = "";
    if ( this.courseId != undefined) {
      this.backend.getCourse( this.courseId).then(course => {
        for(var attendnaceDate in course.dateAndAttendance) {
          var date = attendnaceDate.split("_");
          attendnaceDate = this.monthNames[parseInt(date[0].split("").pop()) - 1] + " " +  date[1] + " " +date[2];
          this.courseDates.push(attendnaceDate);
        }
      })
    } 
  }
  showAttendance(date) {
    date = date.split(" ");
    var attendnaceDate = "date" + (this.monthNames.indexOf(date[0]) + 1) + "_" + date[1] + "_" +date[2]; 
    this.nav.push(AttendanceTabsPage, { id: this.courseId, date : attendnaceDate});
  }
}
