import { Component } from '@angular/core';
import { Page, Toast, NavController } from 'ionic-angular';
import {Backend} from '../../providers/backend/backend';

@Component({
  templateUrl: 'build/pages/signup/signup.html',
})

export class SignupPage {
  name: any;
  email: any;
  password: any;
  user: any;
  CWID : any;
  isProfessor: boolean = false;
successmsg : any;


  constructor(public nav: NavController, public backend: Backend) { }
  registerUser() {
    this.successmsg="";
    if (!this.email || !this.password || !this.name || !this.CWID) {
      let toast = Toast.create({
        message: 'Please enter valid details',
        duration: 3000
      });
      this.nav.present(toast);
      return false;
    }
    if (this.email.search("@leomail.tamuc.edu") == -1 ) {
      let toast = Toast.create({
        message: 'Please enter a valid emailId',
        duration: 3000
      });
      this.nav.present(toast);
      return false;
    }
    if (Number(this.CWID) == NaN || this.CWID.length != 8) {
      let toast = Toast.create({
        message: 'Please enter a valid CWID',
        duration: 3000
      });
      this.nav.present(toast);
      return false;
    }
     if (this.password.length < 8 || this.password.length > 14) {
      let toast = Toast.create({
        message: 'Password length should be between 8 and 14 characters only',
        duration: 3000
      });
      this.nav.present(toast);
      return false;
    }
    var user = {
      name: this.name,
      CWID: this.CWID,
      email: this.email,
      password: this.password,
      isProfessor: this.isProfessor
    }
    console.log(typeof this.CWID);
    
     var  model= this;
    this.backend.registerUser(user).then(function () {
    model.successmsg="User registered successfully";
    });
    this.name = "";
      this.password = "";
      this.CWID = "";
      this.email = "";
      this.isProfessor = false;
      this.successmsg = "";
  }

}
