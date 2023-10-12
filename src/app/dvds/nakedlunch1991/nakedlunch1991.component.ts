import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';


@Component({
  selector: 'app-nakedlunch1991',
  templateUrl: './nakedlunch1991.component.html',
  styleUrls: ['./nakedlunch1991.component.scss']
})
export class Nakedlunch1991Component implements OnInit {

  constructor(
    private commonServices: CommonService
    ) { }
  baseUrl:any="http://shuffletv.ddns.net:1984/api/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=[{"point":"00:00:00","title":"Opening Credit Sequence"},
                     {"point":"00:06:24","title":"Yellow Powder"},
                     {"point":"00:18:02","title":"Doctor Benway"},
                     {"point":"00:27:09","title":"Escape"},
                     {"point":"00:36:17","title":"Tom and Joan Frost"},
                     {"point":"00:43:30","title":"Yves Cloquet"},
                     {"point":"00:50:44","title":"The Martinelli"},
                     {"point":"00:57:41","title":"Mrs. Frost"},
                     {"point":"01:05:39","title":"Fadela"},
                     {"point":"01:13:53","title":"The Friends"},
                     {"point":"01:20:26","title":"The Machine"},
                     {"point":"01:28:40","title":"Have Fun"},
                     {"point":"01:34:56","title":"Exchange"},
                     {"point":"01:40:46","title":"The Truth"},
                     {"point":"01:48:15","title":"Annexia"},
                     {"point":"01:51:30","title":"Closing Credits"}]

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
    this.data.dvd="Naked Lunch 1991"
    this.data.nomeDublado="Mistérios e Paixões 1991"
    this.subtitlesList=[
      {idioma:"ENG", titulo:"english", fileName:"Sub"},
      {idioma:"OFF", titulo:"portuguese",  fileName:""}]
    this.audioList=[
      {idioma:"ORG", titulo:"original"},
      {idioma:"PORT", titulo:"portuguese",tipo:"noiteFilmes"}]
    this.data.subtitlesList=this.subtitlesList
    this.data.audioList=this.audioList
    this.data.duracaoDoFilme="1:55:08"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
    this.setBackgroundImage("mainMenu")
    this.setMenuAudioVolume()
  }
  
  changeScreen(screen,currentTime?){
    this.setMenuAudioVolume()
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="1:55:08"
    this.scenePage=1
    this.menuMode=true
    this.movieMode=false
    this.selectedScreen=screen
    this.setBackgroundImage(screen)
    if(screen=='mainMenu'){
      this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    }
  }

  setMenuAudioVolume(){
    setTimeout(()=>{
      let audio = document.getElementsByTagName('audio')[0]
      audio.volume = 0.05
    },100)    
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
    this.data.duracaoDoFilme = "0:01:39"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }
}
