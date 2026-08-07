import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-alphaville1965',
  templateUrl: './alphaville1965.component.html',
  styleUrls: ['./alphaville1965.component.scss']
})
export class Alphaville1965Component {

  constructor(
    private commonServices: CommonService
    ) { }
  baseUrl:any="http://thisisshuffletv/files/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=["0:0:20","0:08:43","0:17:23","0:24:25",
                     "0:32:17","0:36:12","0:46:40","1:04:59",
                     "1:07:00","1:08:42","1:23:49","1:32:37"]

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
  scenePage:number
  currentVideoTime:any


  ngOnInit(): void {
    this.currentVideoTime=0
    this.scenePage=1
    this.data.dvd="Alphaville 1965"
    this.subtitlesList=[
      {idioma:"ENG", fileName:"Sub eng"},
      {idioma:"SPA", fileName:"Sub spa"},
      {idioma:"PORT", fileName:"Sub"},
      {idioma:"OFF", fileName:""}]
    this.data.subtitlesList=this.subtitlesList
    this.chapterPoints= this.chapterPoints.map(point=>{return {"point":point}})
    this.data.duracaoDoFilme="1:39:30"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mkv#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
    this.setBackgroundImage("mainMenu")
    setTimeout(()=>{
      let audio = document.getElementsByTagName('audio')[0]
      audio.volume = 0.05
    },500)
  }
  
  changeScreen(screen,currentTime?){
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="1:39:30"
    this.scenePage=1
    this.menuMode=true
    this.movieMode=false
    this.selectedScreen=screen
    this.setBackgroundImage(screen)
    if(screen=='mainMenu'){
      this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mkv#t="+this.currentVideoTime
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
    if(this.scenePage<=this.chapterPoints.length){
      return this.baseUrl+encodeURI(this.data.dvd)+"/scene_"+(this.scenePage)+".mp4"
    }
  }

  goToScene(i){
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mkv#t="+
                  this.commonServices.toSeconds(this.chapterPoints[this.scenePage-1]['point'])
    console.log(this.data.url)
    this.playMovie()
  }

  scenePagination(direction){
    if(direction=="down"&&this.scenePage<11){
      this.scenePage++
    }
    if(direction=="up"&&this.scenePage>1){
      this.scenePage--
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
    this.data.duracaoDoFilme = "0:01:27"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }
}
