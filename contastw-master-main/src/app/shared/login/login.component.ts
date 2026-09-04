import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm = new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email]),
    password: new FormControl('',[Validators.required])
  });

  constructor(private as: AuthService, private router: Router){


  }

 async onLoginWithGoogle() {
    try {
      await this.as.loginWithGoogle();
      // O método loginWithGoogle já faz o redirecionamento após sucesso
    } catch (error) {
      console.error("Erro ao tentar fazer login com Google:", error);
      // Aqui você pode adicionar lógica para exibir mensagens de erro para o usuário
    }


  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const {email, password} = this.loginForm.value;
      try {
        await this.as.loginWithEmailAndPassword(email as string, password as string);
        // Não precisamos verificar o usuário aqui pois o loginWithEmailAndPassword já faz o redirecionamento
      
      } catch (error) {
         console.error('Erro ao tentar fazer login:', error);
         // Lógica para exibir mensagens de erro para o usuário
      }
    }
  }


}
