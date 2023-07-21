import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/services/common.service';


@Component({
  selector: 'app-obandidodaluzvermelha1968',
  templateUrl: './obandidodaluzvermelha1968.component.html',
  styleUrls: ['./obandidodaluzvermelha1968.component.scss']
})
export class Obandidodaluzvermelha1968Component {

  constructor(private http: HttpClient,
    private commonServices: CommonService) { }
  baseUrl:any="http://casadopier.ddns.net:1984/api/assets/dvds/"
  filmesDvds:any

  subList:Array<string>
  audioList:Array<string>

  url:any
  picUrl:string=""
  subUrl:string=""
  audioUrl:string=""
  filme:any
  
  dvd="O Bandido Da Luz Vermelha 1968"

  menuPrincipal:any="Main Menu.mp4"
  menuCurtas:any="Menu Curtas.mp4"
  menuSpecialFeatures:any="Special Features Selection.mp4"
  menuLanguageSelection:any="Language Selection.mp4"
  menuSceneSelection:any="Scene Selection 1-4.mp4"
  menuTrailers:any="Trailers 0.mp4"
  menuCast:any="Cast.mp4"

  menuSceneSelectionList:any

  loop:boolean=false
  exibeVideo:boolean=false
  grid6:boolean=false
  movieMode:boolean=false
  mudo:boolean=true
  pictureMode:boolean=false

 
  pictureLimit:number
  pictureCount:number=1

  selectedScreen:string
  selectedSubtitle:string=""
  selectedAudio:string=""

  chapterRange:any
  chapterPoints:any={
    "1-4":["0:0:00","0:10:07","0:18:50","0:27:03"],
    "5-8":["0:40:40","0:46:11","0:55:12","0:59:16"],
    "9-12":["01:06:44","01:13:36","01:17:20","01:30:46"]
  }
  
  extensoes:Array<String>=[
    "mp4","m4v","flv","mkv","wmv","webm"
  ]

  ngOnInit(): void {

    this.http.get("http://casadopier.ddns.net:1984/api/listaDvds")
    .subscribe(response=>{

      let listaDvds:any= response
      let filmeSelecionado = listaDvds.filter(filme=>filme.includes(this.dvd))
      console.log(filmeSelecionado)
      
      // this.subList=filmeSelecionadoList.filter(sub=>sub.slice(-3)=="vtt")      
      // this.audioList=filmeSelecionadoList.filter(sub=>sub.slice(-3)=="mp3")
      // this.pushPorExtensao(filmeSelecionadoList,this.filmesDvds)

      // this.url=this.baseUrl
      // +encodeURI(this.dvd)+encodeURI(this.menuPrincipal)
      this.url=this.baseUrl+encodeURI(this.dvd)+"/Warning.mp4#t=39"
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
      this.url=this.baseUrl+encodeURI(this.dvd)+"/"+encodeURI(this.menuPrincipal)
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

  playMovie(){
    if(sessionStorage.getItem('currentTime')){
      this.url=this.baseUrl+encodeURI(this.dvd)+".mp4#t="+
      parseInt(sessionStorage.getItem('currentTime'))
    } else{
      this.url=this.baseUrl+encodeURI(this.dvd)+".mp4"
    }


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

  playTrailer(trailer){
    this.loop=false
    this.url=this.baseUrl+encodeURI(this.dvd)+"/"+trailer+".mp4"
    this.movieMode=true
    this.selectedScreen=""
    this.load()
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

  setSubtitle(sub){
    console.log(sub)
    if(sub=='english'){
      this.selectedSubtitle = this.baseUrl+encodeURI(this.dvd)+encodeURI('/Sub eng.vtt')
    } else{
      this.selectedSubtitle=""
    }
    sessionStorage.setItem("subtutle",this.selectedSubtitle)
  }

  changeScreen(screen){
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

  changeChapterRange(range){
    this.chapterRange=range
    this.url=this.baseUrl+encodeURI(this.dvd)
            +encodeURI("/Scene Selection "+range+".mp4")
    this.load()
  }

  selectScene(scene){
    this.chapterRange=this.chapterRange?this.chapterRange:'1-4'
    let point = this.chapterPoints[this.chapterRange][scene-1]
    this.url=this.baseUrl+encodeURI(this.dvd)+".mp4#t="+this.commonServices.toSeconds(point)
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

  load(){    
    let video = document.getElementsByTagName("video")[0]
    video.load()
  }

  reloadImg(){
    this.pictureMode=false
    setTimeout(()=>{
      this.pictureMode=true
    },100)
  }

  pushPorExtensao(response,lista){
    this.extensoes.map(extensao=>{
      response.filter(video=>video.slice(-extensao.length)==extensao).map(video=>{
        lista.push(video)
      })
    })
    lista=lista.sort()
  }
  
  getCurrentVideotime(){
    let video = document.getElementsByTagName("video")[0]
    console.log("currentTime",video.currentTime)
    sessionStorage.setItem("currentTime",video.currentTime.toString())
  }

}
