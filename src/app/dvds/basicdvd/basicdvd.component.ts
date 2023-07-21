import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-basicdvd',
  templateUrl: './basicdvd.component.html',
  styleUrls: ['./basicdvd.component.scss']
})
export class BasicdvdComponent implements OnInit {

  constructor(
    private commonServices: CommonService,
    private sanitizer: DomSanitizer
    ) {
      // this.googleFont= sanitizer.bypassSecurityTrustResourceUrl("https://fonts.googleapis.com/css2?family=Teko&display=swap");
     }
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
  

  chapterPoints:any=[
    {"title": "Start","point": "00:00:00"},
    {"title": "Condition Red","point": "00:03:07"},
    {"title": "Abroad the Leper Colony: Wing Attack Plan R","point": "00:05:48"},
    {"title": "Fred calls Buck","point": "00:11:38"},
    {"title": "Three Simple Rules","point": "00:14:53"},
    {"title": "Attack Profile","point": "00:16:25"},
    {"title": "Briefing Group Captain Mandrake","point": "00:19:15"},
    {"title": "In the War Room","point": "00:24:11"},
    {"title": "General Turgidson's Six Points","point": "00:31:59"},
    {"title": "Survival Kit Contents Check","point": "00:35:28"},
    {"title": "Ambassador De Sadesky","point": "00:36:26"},
    {"title": "Friendly Fire","point": "00:38:19"},
    {"title": "Merkin and Dimitri","point": "00:39:58"},
    {"title": "A Monstruous Commie Plot","point": "00:45:32"},
    {"title": "The Doomsday Machine: Dr. Strangelove","point": "00:49:08"},
    {"title": "Ripper Fires back:How he Developed his Theory","point": "00:53:56"},
    {"title": "The Base Surrenders: Ripper Checks Out","point": "00:57:22"},
    {"title": "Evasive Action: Three Engines Hit","point": "01:01:20"},
    {"title": "POE: Colonel 'Bat' Guano","point": "01:05:25"},
    {"title": "Assessing the Damage","point": "01:07:45"},
    {"title": "Deviant Pervert: Calling the President","point": "01:09:29"},
    {"title": "Code OPE Acknowledged: One Plane Left","point": "01:13:14"},
    {"title": "A Charge of Target","point": "01:17:46"},
    {"title": "Is There Really a Chance...","point": "01:19:23"},
    {"title": "Final checks: Bombs Doors Negative","point": "01:20:35"},
    {"title": "Yahoo!!!","point": "01:26:55"},
    {"title": "100-Year Plan: 'Mein Fuhrer! I Can Walk!'","point": "01:27:35"},
    {"title": "We'll Meet Again","point": "01:32:56"}
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
    this.data.dvd="Dr Strangelove 1964"
    this.data.nomeDublado="Dr Fantastico"
    this.subtitlesList=[
      {idioma:"ENG", titulo:"english", fileName:"Sub"},
      {idioma:"OFF", titulo:"portuguese",  fileName:""}]
    this.audioList=[
      {idioma:"ORG", titulo:"original"},
      {idioma:"PORT", titulo:"portuguese",tipo:"madrugadaFilmes"}]
    this.data.subtitlesList=this.subtitlesList
    this.data.audioList=this.audioList
    this.data.duracaoDoFilme="1:37:27"
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
    this.data.duracaoDoFilme="1:37:27"
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
  
  playTrailer(){
    this.data.duracaoDoFilme = "0:03:25"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }
}
