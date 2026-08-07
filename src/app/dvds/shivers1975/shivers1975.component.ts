import { Component, Inject, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-shivers1975',
  templateUrl: './shivers1975.component.html',
  styleUrls: ['./shivers1975.component.scss']
})
export class Shivers1975Component implements OnInit {

  constructor(
    private commonServices: CommonService
    ) { }
  baseUrl:any="http://thisisshuffletv/files/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=["0:00:00","0:10:08","0:20:22","0:29:48",
                     "0:40:22","0:50:12","1:01:42","1:19:58"]

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
    this.data.dvd="Shivers 1975"
    this.subtitlesList=[{idioma:"English", fileName:"Sub eng"},{idioma:"Off", fileName:""}]
    this.data.subtitlesList=this.subtitlesList
    this.chapterPoints= this.chapterPoints.map(point=>{return {"point":point}})
    this.data.duracaoDoFilme="1:27:28"
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
    this.data.duracaoDoFilme="1:51:35"
    this.menuMode=true
    this.movieMode=false
    this.selectedScreen=screen
    this.setBackgroundImage(screen)
    if(screen=='mainMenu'){
      this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    }
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
