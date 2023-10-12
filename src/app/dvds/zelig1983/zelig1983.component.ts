import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-zelig1983',
  templateUrl: './zelig1983.component.html',
  styleUrls: ['./zelig1983.component.scss']
})
export class Zelig1983Component implements OnInit {

  constructor(
    private commonServices: CommonService
    ) { }
  baseUrl:any="http://shuffletv.ddns.net:1984/api/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=[{"point":"00:00:00"},
                     {"point":"00:07:47"},
                     {"point":"00:14:27"},
                     {"point":"00:22:31"},
                     {"point":"00:31:43"},
                     {"point":"00:40:52"},
                     {"point":"00:50:34"},
                     {"point":"01:02:21"},
                     {"point":"01:12:29"}]

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
    this.data.dvd="Zelig 1983"
    this.subtitlesList=[
      {idioma:"ENG", titulo:"english", fileName:"Sub.eng"},
      {idioma:"POR", titulo:"portuguese",  fileName:"Sub"}]
    this.audioList=[]
    this.data.subtitlesList=this.subtitlesList
    this.data.audioList=this.audioList
    this.data.duracaoDoFilme="1:19:08"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    // this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
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
    this.data.duracaoDoFilme = "0:00:47"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }
}
