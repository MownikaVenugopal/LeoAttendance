import { Component } from '@angular/core';
import { Page, Toast, NavController, Loading, Events } from 'ionic-angular';
import {Backend} from '../../providers/backend/backend';
import {SignupPage} from '../signup/signup'
import {ProfessorMainPage} from '../professor-main/professor-main';
import {StudentTabsPage} from '../student-tabs/student-tabs';

@Component({
  templateUrl: 'build/pages/login/login.html',
})

export class LoginPage {
  email: any;
  password: any;
  token: any;
  userObject: any;
  errormsg : any;
  loading : any;
  constructor(public nav: NavController, public backend: Backend, public events: Events) {
    this.nav = nav;
    this.email = "";
    this.password = "";
  }

  ionViewDidEnter() {
    var self = this;
    this.events.subscribe('user:loggedin', (userEventData) => {
      console.log("reaching login with mobile successfully");
      self.goToMainPageIfLoggedIn();
    }); 
    this.events.subscribe('user:log', (userEventData) => {
      console.log(userEventData);
      this.errormsg="Invalid details";
      this.loading.dismiss();
    });


    this.goToMainPageIfLoggedIn();
  }

  goToMainPageIfLoggedIn() {
    let userDetails = this.backend.userDetails;
    if (userDetails) {
      if (userDetails.isProfessor) {
        this.nav.setRoot(ProfessorMainPage);
      } else {
        this.nav.setRoot(StudentTabsPage);
      }
    }
  }

  validateUser() {
    this.errormsg="";
    var user = {
      email: this.email,
      password: this.password
    }
    if (!this.email || !this.password) {
      let toast = Toast.create({
        message: 'Please enter valid details',
        duration: 3000
      });
      this.nav.present(toast);
      return false;
    }

    this.loading = Loading.create({
      content: 'Please wait...'
    });

    this.nav.present(this.loading);
    var self = this;
    this.backend.loginUser(user).then(function () {
      self.loading.dismiss();
    }).catch(function (e) {
      self.loading.dismiss();
       var  model= this;
      console.log("error invalid user", e);
      model.errormsg="Invalid details";
    })
  }
  signIn() {
    this.nav.push(SignupPage);
  }
}
