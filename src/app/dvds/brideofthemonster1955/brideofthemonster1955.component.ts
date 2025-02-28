import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-brideofthemonster1955',
  templateUrl: './brideofthemonster1955.component.html',
  styleUrls: ['./brideofthemonster1955.component.scss']
})
export class Brideofthemonster1955Component implements OnInit {

  constructor(
    private commonServices: CommonService,
    ) { }
  baseUrl:any="http://thisisshuffletv.:1991/api/assets/dvds/"
  elem: any;
  data:any={};
  playWithColor:boolean;

  chapterPoints:any=[
    {
        "title": "CREDITS",
        "point": "00:00:00"
    },
    {
        "title": "AN ANBITIOUS NEWS REPORTER",
        "point": "0:10:30"
    },
    {
        "title": "A STRANGE EXPERT",
        "point": "00:18:02"
    },
    {
        "title": "MISSING",
        "point": "00:27:20"
    },
    {
        "title": "THE PATH TO THE OLD WILLOW'S PLACE",
        "point": "00:38:21"
    },
    {
        "title": "THE BRIDE OF THE MONSTER",
        "point": "00:45:16"
    },
    {
        "title": "A SUCCESSFUL EXPERIMENT",
        "point": "00:54:22"
    },
    {
        "title": "A BIG EXPLOSION",
        "point": "01:01:39"
    }]
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
  urlBioPic:string
  scenePage:number
  currentVideoTime:any


  ngOnInit(): void {
    this.currentVideoTime=0
    this.playWithColor=false
    this.scenePage=1
    this.data.dvd="Bride of the Monster 1955"
    this.subtitlesList=[
      {idioma:"eng",titulo:"ENG", fileName:"Sub eng"},
      {idioma:"port",titulo:"PORT", fileName:"Sub"},
      {idioma:"off",titulo:"", fileName:""}
    ]
    this.data.subtitlesList=this.subtitlesList
    this.data.duracaoDoFilme="1:08:45"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
    this.setBackgroundImage("mainMenu")
  }
  
  changeScreen(screen,currentTime?){
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="1:08:45"
    this.setUrlWithColorOrNot()
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
      if(item['idioma']!="off"&&item['idioma']==sub){
        this.data.selectedSubtitle = this.baseUrl+encodeURI(this.data.dvd)+encodeURI('/'+item['fileName']+'.vtt')
      }
    })
    this.setUrlWithColorOrNot()
    this.playMovie()
  }

  goToScene(i){
    
    let ind = this.scenePage==1? i+1:i+6
    let colorSetting = this.playWithColor?"/Color.mp4#t=":".mp4#t="

    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+colorSetting+
                  this.commonServices.toSeconds(this.chapterPoints[ind-1]['point'])
    this.playMovie()
  }

  hoverScene(i){
    this.exibeScenePreview=false
    setTimeout(()=>{
      this.scenePreviewUrl=this.playWithColor?
                           this.baseUrl+encodeURI(this.data.dvd)+"/sceneColor_"+(i+1)+".mp4":
                           this.baseUrl+encodeURI(this.data.dvd)+"/scene_"+(i+1)+".mp4"
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
  
  playExtra(extra){
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/"+extra+".mp4"
    this.menuMode=false
    this.movieMode=true
  }

  playMovieInColor(bollean){
    this.playWithColor=bollean
    this.setUrlWithColorOrNot()
    this.playMovie()
  }

  setUrlWithColorOrNot(){
    this.data.url=this.playWithColor?this.baseUrl+encodeURI(this.data.dvd)+"/Color.mp4#t="+this.currentVideoTime:
                                     this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime    
  }


}
