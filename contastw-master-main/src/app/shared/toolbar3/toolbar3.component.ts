import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-toolbar3',
  imports: [],
  templateUrl: './toolbar3.component.html',
  styleUrl: './toolbar3.component.css'
})
export class Toolbar3Component {


  constructor(private router: Router, private as: AuthService){


  }
onLogout() {

  this.as.logout()
  this.router.navigate(['/login']).then(() => {
    window.location.reload();
});


}

}
