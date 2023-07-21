import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-lolita1962',
  templateUrl: './lolita1962.component.html',
  styleUrls: ['./lolita1962.component.scss']
})
export class Lolita1962Component implements OnInit {

  constructor(
    private commonServices: CommonService,
    private sanitizer: DomSanitizer
    ) { }
  baseUrl:any="http://casadopier.ddns.net:1984/api/assets/dvds/"
  elem: any;
  data:any={};
  googleFont:any
  labels={"movie":"Movie",
          "menu":"Menu",
          "scenes":"Scenes",
          "languages":"Languages",
          "trailer":"Trailer",
          "subtitles":"SUBTITLES",
          "audio":"AUDIO"}
  textColor:"#fff"
  textFontFamily:"'Teko', sans-serif"
  

  chapterPoints:any=[{"title":"Opening Credits","point":"00:00:00"},
                     {"title":"4 Years Earlier","point":"00:12:17"},
                     {"title":"The Summer Dance","point":"00:20:05"},
                     {"title":"A Cozy Little Dinner","point":"00:28:52"},
                     {"title":"Dreamy Childishness","point":"00:36:44"},
                     {"title":"A Father to My Little Girl","point":"00:48:47"},
                     {"title":"The Perfect Murder","point":"00:57:36"},
                     {"title":"Perfectly Decent","point":"01:06:38"},
                     {"title":"Two Normal Guys","point":"01:18:19"},
                     {"title":"Hey, Let's Tell Mother","point":"01:28:10"},
                     {"title":"Six Months Have Passed","point":"01:38:30"},
                     {"title":"Tremble Not, Little Nymph","point":"01:50:50"},
                     {"title":"A Strange Car Following Us","point":"02:00:30"},
                     {"title":"A White, Widowed Male","point":"02:11:12"},
                     {"title":"Ironing Day","point":"02:17:34"},
                     {"title":"We'll Start Afresh","point":"02:28:53"},
                     {"title":"Quilty!","point":"02:32:11"}]

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
    this.googleFont= this.sanitizer.bypassSecurityTrustResourceUrl("https://fonts.googleapis.com/css2?family=Teko&display=swap");
    this.currentVideoTime=0
    this.scenePage=1
    this.data.dvd="Lolita 1962"
    this.subtitlesList=[
      {idioma:"ENG", titulo:"english", fileName:"Sub"},
      {idioma:"OFF", titulo:"portuguese",  fileName:""}]
    this.audioList=[
      {idioma:"ORG", titulo:"original"},
      {idioma:"PORT", titulo:"portuguese",tipo:"madrugadaFilmes"}]
    this.data.subtitlesList=this.subtitlesList
    this.data.audioList=this.audioList
    this.data.duracaoDoFilme="2:33:32"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
    this.setBackgroundImage("mainMenu")
    setTimeout(()=>{
      let audio = document.getElementsByTagName('audio')[0]
      audio.volume = 0.05},500)
  }

  ngAfterViewChecked(){
    console.log("ngAfterViewChecked")
    this.setStyle()
  }

  setStyle(){
    let classCount = document.getElementsByClassName("main-menu-control__button").length
    console.log("classCount",classCount)
    for (let i=0;i<classCount;i++){
      console.log("X")
      document.getElementsByClassName("main-menu-control__button")[i]["style"]["color"]="green"
    }
  }
  
  changeScreen(screen,currentTime?){
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="2:33:32"
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
                  this.commonServices.toSeconds(this.chapterPoints[i]['point'])
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
  
  playTrailer(){
    this.data.duracaoDoFilme = "0:01:01"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }
}
