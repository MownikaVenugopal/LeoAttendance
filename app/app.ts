import {Component, ViewChild} from '@angular/core';
import {App, ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {LoginPage} from './pages/login/login';
import {Backend} from './providers/backend/backend';
import {SettingsPage} from './pages/settings/settings';
import {UserProfilePage} from './pages/user-profile/user-profile';
import '../node_modules/chart.js/dist/Chart.bundle.min.js';


@Component({
  templateUrl: 'build/app.html',
  providers: [Backend]
})

class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = LoginPage;
  pages: Array<{ title: string, component: any }>;
  userObject: any;
  username: any;
  constructor( private platform: Platform, private menu: MenuController, private backend : Backend) {
    this.initializeApp();
    this.pages = [
      { title: 'Settings', component: SettingsPage },
      { title: 'Profile',  component: UserProfilePage},
      { title: 'logout', component : null} 
    ];
  }
  ionViewDidEnter() {
    this.userObject = this.backend.userDetails;
    if(this.userObject != null) {
      this.username = this.userObject.name;
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    this.menu.close();
    if(page.title == "logout") {
        this.backend.logout();
        this.nav.setRoot(LoginPage);
      } else {
      this.nav.push(page.component);
    }
  }
}

ionicBootstrap(MyApp);
