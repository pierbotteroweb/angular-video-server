import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-crash1996',
  templateUrl: './crash1996.component.html',
  styleUrls: ['./crash1996.component.scss']
})
export class Crash1996Component implements OnInit {

  constructor(
    private commonServices: CommonService,
    ) { }
  baseUrl:any="/files/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=[
    {
        "title": "LOGOS/OPENING CREDITS",
        "point": "00:00:00"
    },
    {
        "title": "THE BALLARDS",
        "point": "00:02:39"
    },
    {
        "title": "FERTILE COLLISION",
        "point": "00:06:44"
    },
    {
        "title": "BEDSIDE MANNER",
        "point": "00:08:22"
    },
    {
        "title": "BALLARD 435",
        "point": "00:14:39"
    },
    {
        "title": "THE GOOD DOCTOR",
        "point": "00:19:43"
    },
    {
        "title": "LITTLE BASTARD",
        "point": "00:28:43"
    },
    {
        "title": "AFTERMATH",
        "point": "00:31:39"
    },
    {
        "title": "NERVE CENTER",
        "point": "00:35:46"
    },
    {
        "title": "867 VPD",
        "point": "00:39:37"
    },
    {
        "title": "MENAGE A TROIS",
        "point": "00:41:42"
    },
    {
        "title": "THE SEAGRAVES AT HOME",
        "point": "00:46:47"
    },
    {
        "title": "BENEVOLENT PSYCHOPATHOLOGY",
        "point": "00:49:08"
    },
    {
        "title": "THE DOG IS BRILLIANT",
        "point": "00:51:46"
    },
    {
        "title": "CARWASH",
        "point": "00:56:44"
    },
    {
        "title": "TENDER BRUISES",
        "point": "01:02:20"
    },
    {
        "title": "SOFT SHELL",
        "point": "01:06:46"
    },
    {
        "title": "FULL THROTTLE",
        "point": "01:15:18"
    },
    {
        "title": "NOCTURNES",
        "point": "01:24:52"
    },
    {
        "title": "MAYBE THE NEXT ONE DARLING",
        "point": "01:27:31"
    },
    {
        "title": "END CREDITS",
        "point": "01:29:35"
    }
]
  url:string
  scenePreviewUrl:string
  backgroundMenuUrl:any
  menuAudioUrl:string
  
  exibeVideo:boolean=true
  exibeScenePreview:boolean=false
  movieMode:boolean=false
  menuMode:boolean=false

  subUrl:string=""
  selectedSubtitle:string=""
  subList:Array<string> 
  subtitlesList:Array<Object>

  selectedScreen:string
  backgroundMenu:any
  currentVideoTime:any


  ngOnInit(): void {
    this.currentVideoTime=0
    this.data.dvd="Crash 1996"
    this.subtitlesList=[
      {idioma:"eng", titulo:"ENGLISH", fileName:"Sub eng"},
      {idioma:"port", titulo:"PORTUGUESE", fileName:"Sub port"},
      {idioma:"none", titulo:"OFF", fileName:""}
    ]
    this.data.subtitlesList=this.subtitlesList
    this.data.duracaoDoFilme="1:36:09"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
    this.setBackgroundImage("mainMenu")
  }

  changeScreen(screen,currentTime?){
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="1:36:09"
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
    if(sub=='eng'){
      this.data.selectedSubtitle = this.baseUrl+encodeURI(this.data.dvd)+encodeURI('/Sub eng.vtt')
    } else if(sub=='port'){
      this.data.selectedSubtitle = this.baseUrl+encodeURI(this.data.dvd)+encodeURI('/Sub port.vtt')
    } else{
      this.data.selectedSubtitle=""
    }
    this.playMovie()
  }


  goToScene(i){
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+
                  this.commonServices.toSeconds(this.chapterPoints[i]['point'])
    this.playMovie()
  }

  hoverScene(i){
    this.exibeScenePreview=false
    setTimeout(()=>{
      this.scenePreviewUrl=this.baseUrl+encodeURI(this.data.dvd)+"/scene-"+(i+1)+".mp4"
      this.exibeScenePreview=true
    },500)
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
    this.data.duracaoDoFilme="0:01:36"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }
  
}
