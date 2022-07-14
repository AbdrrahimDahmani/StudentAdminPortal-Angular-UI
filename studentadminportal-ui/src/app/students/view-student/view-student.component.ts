import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Gender } from 'src/app/models/ui-models/gender.model';
import { Student } from 'src/app/models/ui-models/student.model';
import { GenderService } from 'src/app/services/gender.service';
import { __param } from 'tslib';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.component.html',
  styleUrls: ['./view-student.component.css']
})
export class ViewStudentComponent implements OnInit {
  studentId : string | null |undefined;
  student : Student = {
    id:'',
    firstName:'',
    lastName:'',
    dateOfBirth:'',
    email:'',
    mobile:0,
    genderId:'',
    profileImageUrl:'',
    gender:{
      id:'',
      description:''
    },
    address:{
      id:'',
      physicalAddress:'',
      postalAddress:''
    }
  };
  isNewStudent=false;
  header='';
  displayProfileImageUrl='';
  @ViewChild('studentDetailsForm') studentDetailForm?:NgForm;

  genderList:Gender[]=[];
  constructor(private readonly studentService:StudentService,
              private readonly route:ActivatedRoute,
              private readonly genderService:GenderService,
              private readonly snackBar:MatSnackBar,
              private readonly router:Router
              ) {

   }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (params)=>{
        this.studentId=params.get('id');
        if(this.studentId){
            if(this.studentId.toLowerCase()==='Add'.toLowerCase()){
                this.isNewStudent=true;
                this.header='Add New Student';
                this.setImage();
            }
            else{
              this.isNewStudent=false;
              this.header='Edit Student';
              this.setImage();
              this.studentService.getStudent(this.studentId).subscribe(
              (successResponse)=>
              {
                this.student=successResponse;
                this.setImage();
              }
            );

            }

            this.genderService.getGenderList()
            .subscribe(
              (successResponse)=>
              {
                this.genderList=successResponse;
              },
              (errorReponse)=>{
                this.setImage();
              }
            )
    }
      } )
  }
  onUpdate():void{
     this.studentService.updateStudent(this.student.id,this.student)
     .subscribe(
      (successResponse)=>{
        this.snackBar.open('Student updated successfully',  undefined,{duration:2000});
        setTimeout(()=>{
          this.router.navigateByUrl('students')},2000);
      },
      (errorResponse)=>{
        this.snackBar.open('Cant update student',  undefined,{duration:2000});
      }
     )
  }
  onDelete():void{
    this.studentService.deleteStudent(this.student.id)
    .subscribe(
      (successResponse)=>{
        this.snackBar.open('Student deleted successfully',undefined,{duration:2000});
        setTimeout( ()=>{
          this.router.navigateByUrl('students')
        },2000)

      },
      (errorResponse)=>{
        this.snackBar.open('Cant delete a sutdent',undefined,{duration:2000})

      }

    )
  }
  onAdd():void{
      if(this.studentDetailForm?.form.valid){
          this.studentService.addStudent(this.student)
        .subscribe(
          (successResponse)=>{
              this.snackBar.open("Student added successufly",undefined,{duration:2000});
              setTimeout(()=>{
                this.router.navigateByUrl(`students/${successResponse.id}`)},2000);
          },
          (errorResponse)=>{
              this.snackBar.open("error",undefined,{duration:2000});
          }
        );
      }


  }
  uploadImage(event:any):void{
    if (this.studentId){
     const file: File= event.target.files[0];
     this.studentService.uploadImage(this.student.id,file)
     .subscribe(
      (successResponse)=>{
        this.student.profileImageUrl=successResponse;
        this.setImage();
        this.snackBar.open("Profile picture added succefully",undefined,{duration:2000});
      },
      (errorResponse)=>{
        console.log(errorResponse);
        this.snackBar.open("error upload",undefined,{duration:2000});

      }

     );
    }
  }
  private setImage():void{
    if(this.student.profileImageUrl){
        this.displayProfileImageUrl=this.studentService.getImagePath(this.student.profileImageUrl);

    }else{
      this.displayProfileImageUrl="/assets/user.png";
    }
  }

}
