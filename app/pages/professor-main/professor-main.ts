import { Component } from '@angular/core';
import { Platform, Alert, Page, ActionSheet, NavController,Loading} from 'ionic-angular';
import {Backend} from '../../providers/backend/backend';
import {AddEditCoursePage} from '../add-edit-course/add-edit-course';
import {LoginPage} from '../login/login';
import {CourseDetailsPage} from '../course-details/course-details';
import {Geolocation} from 'ionic-native'

@Component({
  templateUrl: 'build/pages/professor-main/professor-main.html',
})

export class ProfessorMainPage  {
  courses: any[];
  locations : any[];
  successmsg : any;
  professorLocation: {};
  constructor(public nav: NavController, public backend: Backend, public platform: Platform) {
    this.backend.initialize(this.backend.userDetails._id).then(success => {
      if (success) {
        this.backend.loadCourses(this.backend.userDetails._id).then(courses => {       
          this.courses = courses;  
        });
      }
    });
  }
  // here professor start attendance
  startAttendance(course) {
    let loading = Loading.create({
      content: 'Please wait...'
    });
    this.nav.present(loading);
    this.backend.getLocation().then(location => {
      this.backend.setLocation(location, course._id).then(data => {
        setTimeout(() => {
          loading.dismiss();
        });
        let alert = Alert.create({
          subTitle : "You can start attendance now!",
          buttons: ['OK']
        });
        this.nav.present(alert);
      })
    });
  }  

  addCourse() {
    this.nav.push(AddEditCoursePage);
  }
  
  viewCourse(course) {
    this.nav.push(CourseDetailsPage, { id: course._id })
  }
 
  deleteCourse(course){
    this.successmsg="";
    let deleteConfirm = Alert.create({
      title: 'Delete Course',
      message: 'Are you sure you want to delete this class?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            var  model= this;
            this.backend.deleteCourse(course._id).then(function () {
              console.log("successfully deleted the course");      
              model.successmsg="Successfully Deleted";
            });
          }
        }
      ]
    });
    this.nav.present(deleteConfirm);
  }

  editCourse(course) {
    this.nav.push(AddEditCoursePage, {id: course._id});
  }
}
  