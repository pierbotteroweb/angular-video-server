import { Component, Inject, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-pi1998',
  templateUrl: './pi1998.component.html',
  styleUrls: ['./pi1998.component.scss']
})
export class Pi1998Component implements OnInit {

  constructor(
    private commonServices: CommonService
    ) { }
  baseUrl:any="http://thisisshuffletv:5091/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=[
    "00:00:22",
    "00:01:48",
    "00:06:16",
    "00:12:50",
    "00:17:39",
    "00:24:53",
    "00:30:57",
    "00:37:34",
    "00:44:30",
    "00:52:25",
    "01:00:16",
    "01:07:29",
    "01:13:59",
    "01:21:00"
]

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
  urlBioPic:string

  currentVideoTime:any

  ngOnInit(): void {
    this.currentVideoTime=0
    this.data.dvd="Pi 1998"
    this.subtitlesList=[{idioma:"English", fileName:"Sub eng"},{idioma:"Off", fileName:""}]
    this.data.subtitlesList=this.subtitlesList
    this.chapterPoints= this.chapterPoints.map(point=>{return {"point":point}})
    this.data.duracaoDoFilme="1:24:14"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
    this.urlBioPic=this.baseUrl+encodeURI(this.data.dvd)+"/bioPic.png"
    this.setBackgroundImage("mainMenu")
  }
  
  changeScreen(screen,currentTime?){
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="1:24:14"
    this.menuMode=true
    this.movieMode=false
    this.selectedScreen=screen
    this.setBackgroundImage(screen)
    if(screen=='mainMenu'){
      this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    }
    console.log(screen)
  }

  playBonus(bonus){
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/"+bonus+".mp4"
    this.playMovie()

  }
  
  setSubtitle(sub){
    this.data.selectedSubtitle=""
    this.subtitlesList.map(item=>{
      if(item['idioma']!="off"&&item['idioma']==sub){
        this.data.selectedSubtitle = this.baseUrl+encodeURI(this.data.dvd)+encodeURI('/'+item['fileName']+'.vtt')
      }
    })
    this.playMovie()
  }

  returnSceneUrl(i){
    return this.baseUrl+encodeURI(this.data.dvd)+"/scene_"+(i+1)+".mp4"
  }

  goToScene(i){
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.commonServices.toSeconds(this.chapterPoints[i]['point'])
    this.playMovie()
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
}
