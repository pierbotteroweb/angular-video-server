import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-rosemarysbaby1968',
  templateUrl: './rosemarysbaby1968.component.html',
  styleUrls: ['./rosemarysbaby1968.component.scss']
})
export class Rosemarysbaby1968Component implements OnInit {

  constructor(
    private commonServices: CommonService
    ) { }
  baseUrl:any="http://thisisshuffletv:1991/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=[{"title": "Opening Credits - Lullaby","point": "00:00:12"},
                    {"title": "Apartment 7E","point": "00:02:26"},
                    {"title": "Bramford","point": "00:07:14"},
                    {"title": "Moving","point": "00:08:48"},
                    {"title": "Terry","point": "00:12:49"},
                    {"title": "Minnie and Roman Castevet","point": "00:20:15"},
                    {"title": "Talisman","point": "00:30:34"},
                    {"title": "Baumgart Gets Blind","point": "00:33:45"},
                    {"title": "Let's Have a Baby","point": "00:36:37"},
                    {"title": "Chocolats Mousse","point": "00:39:15"},
                    {"title": "This is Not a Dream!","point": "00:42:16"},
                    {"title": "Pregnant","point": "00:50:12"},
                    {"title": "Dr Sapirstein","point": "00:55:32"},
                    {"title": "Acute Pain","point": "00:59:19"},
                    {"title": "Hutch's Visit","point": "01:01:52"},
                    {"title": "Coma","point": "01:10:11"},
                    {"title": "Happy New Year","point": "01:13:36"},
                    {"title": "Rosemary's Party","point": "01:14:50"},
                    {"title": "The Pain Stops","point": "01:20:25"},
                    {"title": "Getting Ready for the Baby","point": "01:23:22"},
                    {"title": "Hutch's Death","point": "01:24:22"},
                    {"title": "All Of Them Witches","point": "01:25:08"},
                    {"title": "The Name is an Anagram","point": "01:28:33"},
                    {"title": "News About Roman","point": "01:33:56"},
                    {"title": "A Personal Object","point": "01:36:00"},
                    {"title": "The Fragancy","point": "01:39:21"},
                    {"title": "Dr Hill","point": "01:42:09"},
                    {"title": "Andy or Jenny","point": "01:51:45"},
                    {"title": "The Baby","point": "01:58:17"},
                    {"title": "Mother's Milk","point": "02:02:51"},
                    {"title": "He Has His Fathers Eyes","point": "02:05:22"},
                    {"title": "End Credits","point": "02:16:17"}]

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
    this.data.dvd="Rosemarys Baby 1968"
    this.data.nomeDublado="O Bebe de Rosemary"
    this.subtitlesList=[
      {idioma:"ENG", titulo:"english", fileName:"Sub"},
      {idioma:"OFF", titulo:"portuguese",  fileName:""}]
    this.audioList=[
      {idioma:"ORG", titulo:"original"},
      {idioma:"PORT", titulo:"portuguese",tipo:"madrugadaFilmes"}]
    this.data.subtitlesList=this.subtitlesList
    this.data.audioList=this.audioList
    this.data.duracaoDoFilme="2:16:58"
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
    this.data.duracaoDoFilme="2:16:58"
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
    this.data.duracaoDoFilme = "0:02:56"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }
}
