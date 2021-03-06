import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/models/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { UserService } from 'src/app/services/user.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-personnel-account',
  templateUrl: './personnel-account.component.html',
  styleUrls: ['./personnel-account.component.scss']
})
export class PersonnelAccountComponent implements OnInit {

  @Input() userToEdit:User;

  @Output() submit: EventEmitter<any> = new EventEmitter<any>();

  userForm:FormGroup;
  acceptIcon = faCheck;
  cancelIcon = faTimes;
  editing:boolean;
  passwordReset: boolean = false;
  user: User;

  constructor(private userService:UserService, private toastrService:ToastrService, 
    private fb:FormBuilder, private storageService:LocalStorageService) {}

  ngOnInit(): void {
    if(this.userToEdit.firstName==null){
      this.editing=false;
    }
    else{
      this.editing=true;
    }
    this.updateForm();
  }

  updateForm(){
    this.userForm = this.fb.group({
      firstName: [this.userToEdit.firstName, Validators.required],
      lastName:[this.userToEdit.lastName, Validators.required],
      username:[this.userToEdit.username, Validators.required],
      password:[this.userToEdit.password, Validators.required],
      rights:[this.userToEdit.rights , Validators.required],
    });
  }

  resetForm(){
    if(!this.editing){
    this.userForm.reset();
    }
  }

  setAccount(){
    if(!this.editing){
      if (this.userForm.valid) {
        const newUser = this.userForm.value;
        newUser.restaurantId = +this.storageService.getRestaurantId();
        // COOK
        if(this.userForm.get('rights').value === 1){
          this.userService.addCook(newUser).subscribe(data => {
            this.toastrService.success("Cook has been added!");
          }, err => {
            if(err.status === 409) this.toastrService.error('Username has been already taken');
          })
        }
        // WAITER || HEAD_WAITER
        else{
          this.userService.addWaiter(newUser).subscribe(data => {
            this.toastrService.success("Waiter has been added!");
          }, err => {
            if(err.status === 409) this.toastrService.error('Username has been already taken');
          })
        }
        this.resetForm();
      }
    } else {
      if (this.userForm.valid) {
        const updateUser = this.userForm.value;
        updateUser.restaurantId = +this.storageService.getRestaurantId();
        updateUser.id = this.userToEdit.id;
        this.userService.updateUser(updateUser).subscribe(data => {
          this.toastrService.success("Employee has been edited!");
        }, err => {
          if(err.status === 409) this.toastrService.error('Username has been already taken');
        })
        this.submit.emit();
      }
    }
  }

  removeUser(){
    this.userService.deleteUser(this.userToEdit).subscribe(data => {
      this.toastrService.success('Employee has been deleted');
    }, err => {
      this.toastrService.error('Error');
    });
    this.submit.emit();
  }

  setPasswordReset(){
    this.userForm.controls.password.setValue(null);
    this.passwordReset = true;
  }

}
