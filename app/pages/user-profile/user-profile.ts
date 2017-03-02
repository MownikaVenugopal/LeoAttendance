import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {Backend} from '../../providers/backend/backend';


@Component({
  templateUrl: 'build/pages/user-profile/user-profile.html',
})
export class UserProfilePage {
  userObject: any;
  constructor(private nav: NavController, private backend : Backend) {
    this.userObject = this.backend.userDetails;

  }

}
