import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-theaddiction1995',
  templateUrl: './theaddiction1995.component.html',
  styleUrls: ['./theaddiction1995.component.scss']
})
export class TheAddiction1995Component {

  constructor(
    private commonServices: CommonService
    ) { }
  baseUrl:any="http://thisisshuffletv.zapto.org:1991/api/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=["0:13:42.547",  "0:25:51.400",  "0:37:33.977",  "0:46:13.871",  
                     "0:54:03.715",  "1:04:39.976",  "1:16:18.799",  "1:22:22.454"]

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
    this.data.dvd="The Addiction 1995"
    this.subtitlesList=[
      {idioma:"PORT", fileName:"Sub"},
      {idioma:"OFF", fileName:""}]
    this.data.subtitlesList=this.subtitlesList
    this.chapterPoints= this.chapterPoints.map(point=>{return {"point":point}})
    this.data.duracaoDoFilme="1:22:21"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
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
    this.data.duracaoDoFilme="1:22:21"
    this.scenePage=1
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
    console.log(this.data.url)
    this.playMovie()
  }

  scenePagination(direction){
    if(direction=="down"&&this.scenePage<this.chapterPoints.length){
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
    this.data.duracaoDoFilme = "0:01:47"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }

  playExtra(extra) {
    if(extra=="Trailer"){
      this.data.duracaoDoFilme = "0:01:47"
    } else {
      this.data.duracaoDoFilme = "0:30:55"
    }
    this.data.url = this.baseUrl + encodeURI(this.data.dvd)+"/"+extra+".mp4"
    this.menuMode = false
    this.movieMode = true
  }
}
