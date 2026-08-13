import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-dunkirk2017',
  templateUrl: './dunkirk2017.component.html',
  styleUrls: ['./dunkirk2017.component.scss']
})
export class Dunkirk2017Component implements OnInit {

  constructor(
    private commonServices: CommonService,
    ) { }
  baseUrl:any="/files/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=["00:00:00","00:08:51","00:20:13","00:29:06","00:42:32",
                     "00:52:45","01:04:29","01:12:47","01:25:50","01:33:18",
                     "01:39:14"]

  url:string
  backgroundMenuUrl:any
  menuAudioUrl:string
  
  exibeVideo:boolean=true
  movieMode:boolean=false
  menuMode:boolean=false
  
  subUrl:string=""
  selectedSubtitle:string=""
  subList:Array<string> 
  subtitlesList:Array<Object>

  selectedScreen:string
  backgroundMenu:any
  scenePage:number
  currentVideoTime:any


  ngOnInit(): void {
    this.currentVideoTime=0
    this.scenePage=1
    this.data.dvd="Dunkirk 2017"
    this.subtitlesList=[{idioma:"ENG", fileName:"Sub"},{idioma:"OFF", fileName:""}]
    this.data.subtitlesList=this.subtitlesList
    this.chapterPoints= this.chapterPoints.map(point=>{return {"point":point}})
    this.data.duracaoDoFilme="1:46:38"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.setBackgroundImage("mainMenu")
  }
  
  changeScreen(screen,currentTime?){
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="1:46:38"
    this.scenePage=1
    this.menuMode=true
    this.movieMode=false
    this.selectedScreen=screen
    this.setBackgroundImage(screen)
    if(screen=='mainMenu'){
      this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    }
  }
  
  setSubtitle(sub){
    this.data.selectedSubtitle=""
    this.subtitlesList.map(item=>{
      if(item['idioma']!="OFF"&&item['idioma']==sub){
        this.data.selectedSubtitle = this.baseUrl+encodeURI(this.data.dvd)+encodeURI('/'+item['fileName']+'.vtt')
      }
    })
    this.playMovie()
  }

  returnSceneUrl(i){
    let ind = this.scenePage==1? i+1:i+6
    return this.baseUrl+encodeURI(this.data.dvd)+"/scene_"+(ind)+".mp4"
  }

  goToScene(i){
    
    let ind = this.scenePage==1? i+1:i+6
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+
                  this.commonServices.toSeconds(this.chapterPoints[ind-1]['point'])
    this.playMovie()
  }

  scenePagination(direction){
    if(direction=="down"){
      this.scenePage=2
    }
    if(direction=="up"){
      this.scenePage=1
    }

  }
  
  setBackgroundImage(menu){
    this.menuMode=false
    this.backgroundMenuUrl=this.baseUrl+encodeURI(this.data.dvd)+"/"+menu+".jpg"
    this.backgroundMenu="background-image: url('"+this.backgroundMenuUrl+"')"
    this.selectedScreen=menu
    this.menuMode=true
  }

  playMovie(){
    this.menuMode=false
    this.movieMode=true
  }
  
  playTrailer(){
    this.data.duracaoDoFilme = "0:02:18"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }
}
