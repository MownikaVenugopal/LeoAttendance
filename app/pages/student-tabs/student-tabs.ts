import { Component } from '@angular/core';
import {NavController, Events} from 'ionic-angular';
import {EnrolledCoursesPage} from "../enrolled-courses/enrolled-courses";
import {AvailableCoursesPage} from "../available-courses/available-courses";
import {ProfessorMainPage} from "../professor-main/professor-main";

@Component({
  templateUrl: 'build/pages/student-tabs/student-tabs.html',
})

export class StudentTabsPage {
  tab1Root: any = EnrolledCoursesPage;
  tab2Root: any = AvailableCoursesPage;
 
  constructor(public nav: NavController, public events : Events) {
    
  }
  ionViewDidEnter() {
    var self = this;
    this.events.subscribe('professor:main', (data) => {
      self.nav.setRoot(ProfessorMainPage);
    });
  }
}
