import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/services/common.service';


@Component({
  selector: 'app-diehardwithavengeance1995',
  templateUrl: './diehardwithavengeance1995.component.html',
  styleUrls: ['./diehardwithavengeance1995.component.scss']
})
export class Diehardwithavengeance1995Component {

  constructor(
    private commonServices: CommonService,
    private http: HttpClient
    ) { }
  baseUrl:any="http://thisisshuffletv.zapto.org:1991/api/assets/dvds/"
  filmesDvds:any
  subList:Array<string>
  audioList:Array<string>
  url:any
  filme:any
  dvd="Die Hard With A Vengance 1995"
  menuPrincipal:any="Main Menu.mp4"
  menuPrincipalBackToMain:any="Main Menu (Click on Main).mp4"
  menuTrailers:any="Trailers 0.mp4"
  menuSpecialFeatures:any="Special Features Selection 0.mp4"
  menuLanguageSelection:any="Language Selection 0.mp4"
  menuSceneSelection:any="Scene Selection 0.mp4"
  menuSceneSelectionList:any
  menuCast:any="Cast.mp4"
  exibeVideo:boolean=false
  extensoes:Array<String>=[
    "mp4","m4v","flv","mkv","wmv","webm"
  ]
  loop:boolean=false
  selectedScreen:string
  chapterRange:any
  grid6:boolean=false
  movieMode:boolean=false
  audioExterno:boolean=false
  pictureMode:boolean=false
  picUrl:string=""
  pictureLimit:number
  pictureCount:number=1
  subUrl:string=""
  selectedSubtitle:string=""
  audioUrl:string=""
  selectedAudio:string=""

  chapterPoints:any={
    "1-5":["0:0:21","0:3:50","0:8:01","0:13:38","0:22:55"],
    "6-10":["0:27:32","0:32:39","0:37:31","0:40:18","0:48:48"],
    "11-15":["0:52:38","0:58:40","1:04:43","1:07:44","1:11:36"],
    "16-20":["1:17:05","1:20:17","1:24:42","1:28:20","1:32:35"],
    "21-26":["1:39:24","1:43:52","1:47:53","1:53:03","1:55:59","2:00:27"]
  }

  ngOnInit(): void {

    this.http.get("http://thisisshuffletv.zapto.org:1991/api/listaDvds")
    .subscribe(response=>{

      let listaDvds:any= response
      let filmeSelecionado = listaDvds.filter(filme=>filme.includes(this.dvd))
      console.log(filmeSelecionado)
      
      // this.subList=filmeSelecionadoList.filter(sub=>sub.slice(-3)=="vtt")      
      // this.audioList=filmeSelecionadoList.filter(sub=>sub.slice(-3)=="mp3")
      // this.pushPorExtensao(filmeSelecionadoList,this.filmesDvds)

      // this.url=this.baseUrl
      // +encodeURI(this.dvd)+encodeURI(this.menuPrincipal)
      this.url=this.baseUrl
      +encodeURI(this.dvd)+"/Warning.mp4"
      console.log(this.url)
    })  

    setTimeout(()=>{
      this.exibeVideo=true
    },1000)
  }

  
  gerenciaLoop(){
    this.movieMode=false
    if(this.url.includes("Warning")||
       this.url.includes("Click")){
      this.selectedScreen = this.menuPrincipal
      this.url=this.baseUrl
      +encodeURI(this.dvd)+"/"+encodeURI(this.menuPrincipal)
      this.loop=true
      this.load()
    } else if(this.url.includes("Scene%20Selection%200")){
      this.url=this.url.replace("%200","%201-5")
      this.loop=true
      this.load()
    } else if(this.url.includes("Language%20Selection%200")
            ||this.url.includes("Features%20Selection%200")){
      this.url=this.url.replace("Selection%200","Selection")
      this.loop=true
      this.load()
    } else if(this.url.includes("Trailers%200")){
      this.url=this.url.replace("Trailers%200","Trailers")
      this.loop=true
      this.load()
    } else if(this.url.includes("Trailer.mp4")){
      this.selectedScreen = this.menuTrailers
      this.url=this.baseUrl
      +encodeURI(this.dvd)+"/"+encodeURI(this.menuTrailers)
      this.loop=true
      this.load()
    } else if(this.url.includes("Featurette")){
      this.selectedScreen = this.menuSpecialFeatures
      this.url=this.baseUrl
      +encodeURI(this.dvd)+"/"+encodeURI(this.menuSpecialFeatures)
      this.loop=true
      this.load()
    } else {
        this.loop=true
        this.load()
    }
  }

  setSubPosition(){ 
      setTimeout(()=>{
        let cues:any  = document.getElementsByTagName('video')[0].textTracks[0].cues;  
        for(let loop=0;loop<=cues.length-1;loop++){
          cues[loop].line=-3;  
        }
      
      },1000)
  }

  showSubtitles(show){
    let trackElem = document.querySelector("track");
    let track = trackElem.track;      
    track.mode = show?"showing":"hidden";
  }

  changeScreen(screen){
    this.audioExterno=false
    if(this.movieMode){
      this.getCurrentVideotime()
      this.showSubtitles(false)
    }    
    this.exibeVideo=true
    this.movieMode=false
    this.pictureMode=false
    this.selectedScreen=screen
    this.loop=false
    this.url=this.baseUrl+encodeURI(this.dvd)+'/'+encodeURI(screen)
    this.load()
  }

  getCurrentVideotime(){
    let video = document.getElementsByTagName("video")[0]
    console.log("currentTime",video.currentTime)
    sessionStorage.setItem("currentTime",video.currentTime.toString())
  }

  setSubtitle(sub){
    console.log(sub)
    if(sub=='spanish'){
      this.selectedSubtitle = this.baseUrl+encodeURI(this.dvd)+encodeURI('/Sub spa.vtt')
    } else if(sub=='english'){
      this.selectedSubtitle = this.baseUrl+encodeURI(this.dvd)+encodeURI('/Sub eng.vtt')
    } else{
      this.selectedSubtitle=""
    }
    sessionStorage.setItem("subtutle",this.selectedSubtitle)
  }

  changeChapterRange(range){
    // this.exibeVideo=false    
    this.grid6=range=='21-26'
    this.chapterRange=range
    this.url=this.baseUrl+encodeURI(this.dvd)
            +encodeURI("/Scene Selection "+range+".mp4")
    this.load()
  }

  playMovie(){

    if(sessionStorage.getItem('currentTime')){
      this.url=this.baseUrl+encodeURI(this.dvd)+".mkv#t="+
      parseInt(sessionStorage.getItem('currentTime'))
    } else{
      this.url=this.baseUrl+encodeURI(this.dvd)+".mkv"
    }


    if(sessionStorage.getItem('subtutle')){
      this.subUrl= sessionStorage.getItem('subtutle')
      this.showSubtitles(true)
    } else {
      this.subUrl=""
    }

    if(sessionStorage.getItem('audio')){
      let audioInfo = JSON.parse(sessionStorage.getItem('audio'))
      this.audioExterno=audioInfo['audioExterno']
      this.audioUrl=audioInfo['audioUrl']
      
    }


    this.subUrl=this.selectedSubtitle
    this.movieMode=true
    this.selectedScreen=""
    this.load()
    this.setSubPosition()
  }

  playTrailer(trailer){
    this.loop=false
    this.url=this.baseUrl+encodeURI(this.dvd)+"/"+trailer+".mp4"
    this.movieMode=true
    this.selectedScreen=""
    this.load()
  }

  selectScene(scene){
    this.chapterRange=this.chapterRange?this.chapterRange:'1-5'
    let point = this.chapterPoints[this.chapterRange][scene-1]
    this.url=this.baseUrl+encodeURI(this.dvd)+".mkv#t="+this.commonServices.toSeconds(point)
    if(sessionStorage.getItem('subtutle')){
      this.subUrl= sessionStorage.getItem('subtutle')
      this.showSubtitles(true)
    } else {
      this.subUrl=""
    }
    this.subUrl=this.selectedSubtitle
    this.movieMode=true
    this.selectedScreen=""
    this.load()
    this.setSubPosition()
  } 

  pictureScreen(screen,limit){
    this.pictureCount=1
    this.selectedScreen=screen
    this.exibeVideo=false
    this.audioExterno=false
    this.pictureMode=true
    this.pictureLimit = limit
    this.picUrl=this.baseUrl
    +encodeURI(this.dvd)+"/"+encodeURI(screen)
    +(this.pictureCount<10?"0":"")
    +this.pictureCount+'.jpg'
  }

  pictureNext(){
    if(this.pictureCount<=this.pictureLimit){
      this.pictureCount++

      this.picUrl=this.baseUrl
      +encodeURI(this.dvd)+"/"+encodeURI(this.selectedScreen)
      +(this.pictureCount<10?"0":"")
      +this.pictureCount+'.jpg'

      this.reloadImg()
    }
  }

  picturePrevious(){
    if(this.pictureCount>0){

      this.pictureCount--

      this.picUrl=this.baseUrl
      +encodeURI(this.dvd)+"/"+encodeURI(this.selectedScreen)
      +(this.pictureCount<10?"0":"")
      +this.pictureCount+'.jpg'

      this.reloadImg()
    }
  }

  pushPorExtensao(response,lista){
    this.extensoes.map(extensao=>{
      response.filter(video=>video.slice(-extensao.length)==extensao).map(video=>{
        lista.push(video)
      })
    })
    lista=lista.sort()
  }

  load(){    
    let video = document.getElementsByTagName("video")[0]
    video.load()
    if(this.audioExterno){
      setTimeout(()=>{
        let audio = document.getElementsByTagName("audio")[0]
        audio.play()
      },1000)
    }

    setInterval(()=>{
      if(this.audioExterno){        
        let audio = document.getElementsByTagName("audio")[0]
        let video = document.getElementsByTagName("video")[0]
        audio.currentTime = video.currentTime
        audio.play()
      }
    },1000)
  }

  reloadImg(){
    this.pictureMode=false
    setTimeout(()=>{
      this.pictureMode=true
    },100)
  }


  setAudioExterno(idioma){  
    if(idioma=='french'){
      this.audioUrl = this.baseUrl+encodeURI(this.dvd)+encodeURI('Audio fre.mp3')
      this.audioExterno=true
    } else if(idioma=='english'){
      this.audioUrl = this.baseUrl+encodeURI(this.dvd)+encodeURI('Audio eng.mp3')
      this.audioExterno=true
    } else{
      this.audioUrl=""
      this.audioExterno=false
    }    
    sessionStorage.setItem("audio",JSON.stringify({'audioUrl':this.audioUrl,'audioExterno':this.audioExterno}))
  }
}
