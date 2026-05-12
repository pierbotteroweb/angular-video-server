import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-thedayofthejackal1973',
  templateUrl: './thedayofthejackal1973.component.html',
  styleUrls: ['./thedayofthejackal1973.component.scss']
})
export class Thedayofthejackal1973Component implements OnInit {

  constructor(
    private commonServices: CommonService
    ) { }
  baseUrl:any="http://thisisshuffletv:5091/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=[{"point":"00:00:00"},
                     {"point":"00:08:10"},
                     {"point":"00:13:54"},
                     {"point":"00:23:13"},
                     {"point":"00:28:34"},
                     {"point":"00:44:49"},
                     {"point":"00:48:56"},
                     {"point":"00:58:11"},
                     {"point":"01:01:06"},
                     {"point":"01:19:41"},
                     {"point":"01:28:16"},
                     {"point":"01:37:27"},
                     {"point":"01:45:03"},
                     {"point":"02:02:35"},
                     {"point":"02:17:08"},
                     {"point":"02:19:33"}]

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
  audioList:Array<Object>

  selectedScreen:string
  backgroundMenu:any
  urlBioPic:string
  scenePage:number
  currentVideoTime:any


  ngOnInit(): void {
    this.currentVideoTime=0
    this.scenePage=1
    this.data.dvd="The Day Of The Jackal 1973"
    this.data.nomeDublado="O Dia Do Chacal"
    this.subtitlesList=[
      {idioma:"ENG", titulo:"english", fileName:"Sub.eng"},
      {idioma:"POR", titulo:"portuguese",  fileName:"Sub"}]
    this.audioList=[
      {idioma:"ORG", titulo:"original"},
      {idioma:"PORT", titulo:"portuguese",tipo:"noiteFilmes"}]
    this.data.subtitlesList=this.subtitlesList
    this.data.audioList=this.audioList
    this.data.duracaoDoFilme="2:22:31"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
    this.setBackgroundImage("mainMenu")
    // setTimeout(()=>{
    //   let audio = document.getElementsByTagName('audio')[0]
    //   audio.volume = 0.05
    // },500)
  }
  
  changeScreen(screen,currentTime?){
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="2:22:31"
    this.scenePage=1
    this.menuMode=true
    this.movieMode=false
    this.selectedScreen=screen
    this.setBackgroundImage(screen)
    if(screen=='mainMenu'){
      this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    }
  }

  setAudioLanguage(audio){
    this.data.selectedAduioLanguage=audio
    this.playMovie()
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
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+
                  this.commonServices.toSeconds(this.chapterPoints[this.scenePage-1]['point'])
    this.playMovie()
  }

  scenePagination(direction){
    if(direction=="down"&&this.scenePage<this.chapterPoints.length){
      this.scenePage++
    }
    if(direction=="up"&&this.scenePage>1){
      this.scenePage--
    }
    console.log(this.scenePage)
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
    this.data.duracaoDoFilme = "0:02:05"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }
}
