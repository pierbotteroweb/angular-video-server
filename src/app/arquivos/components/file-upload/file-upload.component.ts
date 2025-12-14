import { Component, Input, OnInit, Output } from '@angular/core';
import { MongodbService } from 'src/app/services/mongodb.service';
import { UploadVideoService } from 'src/app/services/upload-video.service';
import { filterResponse, uploadProgress } from 'src/app/shared/rxjs-operators';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  constructor(
    private uploadVideoService: UploadVideoService,
    private mongodbService: MongodbService,
  ) { }

  @Input() videosToUpload
  @Input() url
  @Input() selectedmimeType
  @Input() selectedCanal
  @Input() selectedProgramaDeTv
  @Input() tituloAtracao
  
  progress:number = 0

  ngOnInit(): void {
  }


  
  uploadUsingMongoDb(index){

    if(index<this.videosToUpload.length){

      let subscription = this.uploadVideoService.upload(this.videosToUpload[index], this.url)
      .pipe(
        uploadProgress(progress=>{
          this.progress=progress;
        }),
        filterResponse()
      ).subscribe(
        res=>{
          let videoObj:any = {
            canal:"",
            duracao:"",
            titulo:""
          }
      
          this.mongodbService.createVideo(this.selectedmimeType,videoObj).subscribe((newItemRes:any)=>{
            console.log("newItemRes",newItemRes)
                
            let videoObjUpdate:any = {
              duracao:Math.round(res['message'].file.duration),
              titulo:res['message'].file.name,
              tipo:this.selectedmimeType
            }

            if(this.selectedCanal){
              videoObjUpdate.canal=this.selectedCanal
            }
                  
            if(this.selectedProgramaDeTv){
              videoObjUpdate.programaDeTv=this.selectedProgramaDeTv
              videoObjUpdate.tituloAtracao=this.tituloAtracao
            }

      
            this.mongodbService.updateVideo(newItemRes._id,videoObjUpdate).subscribe((videoUpdated:any)=>{
      
              
            this.uploadUsingMongoDb(index+1)
            })
          })
        }
      )
    }
  }


  onUploadEventChange(event){
    
    const selectedFiles = <FileList>event.srcElement.files

    const fileNames = [];
    this.videosToUpload = [];
    

    for (let i = 0; i< selectedFiles.length; i++){
      let SetOfOne = new Set()
      SetOfOne.add(selectedFiles[i])
      fileNames.push(selectedFiles[i].name)
      this.videosToUpload.push(SetOfOne)
    }

    document.getElementById('customFileLabel').innerHTML = fileNames.join(', ')

    this.progress = 0

  }
  

}
