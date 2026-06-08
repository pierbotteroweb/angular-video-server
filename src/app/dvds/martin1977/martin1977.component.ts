import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-martin1977',
  templateUrl: './martin1977.component.html',
  styleUrls: ['./martin1977.component.scss']
})
export class Martin1977Component implements OnInit {

  constructor(
    private commonServices: CommonService,
    ) { }
  baseUrl:any="http://thisisshuffletv:5091/assets/dvds/"
  elem: any;
  data:any={};
  playWithColor:boolean;

  chapterPoints:any=[
    {
        "title": "CREDITS",
        "point": "00:00:00"
    },
    {
        "title": "ALWAYS VERY CAREFULL WITH THE NEEDLES",
        "point": "00:02:09"
    },
    {
        "title": "PAMGRI",
        "point": "00:10:42"
    },
    {
        "title": "NO MAGIC",
        "point": "00:20:54"
    },
    {
        "title": "JUST A BOY",
        "point": "00:31:14"
    },
    {
        "title": "YOU WANT ME?",
        "point": "00:37:13"
    },
    {
        "title": "THIS IS A CATHOLIC FAMILY",
        "point": "00:57:55"
    },
    {
        "title": "I WAS ALWAYS TOO SHY",
        "point": "01:12:18"
    },
    {
        "title": "CATCHING",
        "point": "01:19:01"
    },
    {
        "title": "NOBODY IN THE TOWN",
        "point": "01:30:40"
    },
    {
        "title": "END CREDITS",
        "point": "01:32:58"
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
    this.data.dvd="Martin 1977"
    this.subtitlesList=[
      {idioma:"esp",titulo:"ESP", fileName:"Sub esp"},
      {idioma:"fra",titulo:"FRA", fileName:"Sub fra"},
      {idioma:"eng",titulo:"ENG", fileName:"Sub eng"},
      {idioma:"port",titulo:"PORT", fileName:"Sub"},
      {idioma:"off",titulo:"", fileName:""}
    ]
    this.data.subtitlesList=this.subtitlesList
    this.data.duracaoDoFilme="1:34:42"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
    this.setBackgroundImage("mainMenu")
  }
  
  changeScreen(screen,currentTime?){
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="1:34:42"
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
