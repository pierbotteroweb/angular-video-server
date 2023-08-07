import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MongodbService } from 'src/app/services/mongodb.service';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-basicdvd',
  templateUrl: './basicdvd.component.html',
  styleUrls: ['./basicdvd.component.scss']
})
export class BasicdvdComponent implements OnInit {

  constructor(
    private commonServices: CommonService,
    private mongodbService: MongodbService,
    private sanitizer: DomSanitizer
    ) { }
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
  textFontFamily:"'Teko', sans-serif";

  chapterPoints:any=[]

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
  dataFromDvdApi:any


  ngOnInit(): void {

    // this.mongodbService.getDvdsById("64bf09e75178a53070997653")
    // .subscribe((data:any)=>{
    //   console.log("DVd data",data)
    // })

    this.mongodbService.getDvds()
    .subscribe((data:any)=>{      
      let dvd = data.find(id=>id._id=="64bf09e75178a53070997653")
      this.data.dvd=dvd.name
      console.log(dvd)
      this.dataFromDvdApi=dvd
      this.googleFont= this.sanitizer.bypassSecurityTrustResourceUrl(dvd.Text_Font);
      this.chapterPoints=dvd.chapters
      this.currentVideoTime=0
      this.scenePage=1
      this.subtitlesList=[
        {idioma:"ENG", titulo:"english", fileName:"Sub"},
        {idioma:"OFF", titulo:"portuguese",  fileName:""}]
      this.audioList=[
        {idioma:"ORG", titulo:"original"},
        {idioma:"PORT", titulo:"portuguese",tipo:"madrugadaFilmes"}]
      this.data.subtitlesList=this.subtitlesList
      this.data.audioList=this.audioList
      this.data.duracaoDoFilme="2:33:32"
      this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
      this.elem = document.documentElement;
      this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
      this.setBackgroundImage("mainMenu")
      setTimeout(()=>{
        let audio = document.getElementsByTagName('audio')[0]
        audio.volume = 0.05
      },500)
    })
  }
  
  ngAfterViewChecked(){
    console.log("ngAfterViewChecked")
    this.setStyle("container-fluid","font-family","'Pacifico', cursive")

    this.setStyle("main-menu-control","top","19vh")
    this.setStyle("main-menu-control","left","19vw")

    this.setStyle("main-menu-control__button","color","#F33320")
    this.setStyle("main-menu-control__button","display","block")
    this.setStyle("main-menu-control__button","margin","initial")

    this.setStyle("scenes","color","#F33320")
    this.setStyle("scenes","width","25vw")
    this.setStyle("scenes","top","53vh")
    this.setStyle("scenes","left","19vw")

    this.setStyle("languages-menu","top","62vh")
    this.setStyle("languages-menu","left","19vw")
    
    this.setStyle("subtitles-menu","color","#F33320")
    this.setStyle("subtitles-menu","top","62vh")
    this.setStyle("subtitles-menu","left","19vw")
    
    this.setStyle("audio-language-menu","color","#F33320")
    this.setStyle("audio-language-menu","top","62vh")
    this.setStyle("audio-language-menu","left","36vw")
    
  }

  setStyle(className,styleProperty:string,value:string){
    let classCount = document.getElementsByClassName(className).length
    for (let i=0;i<classCount;i++){
      document.getElementsByClassName(className)[i]["style"][styleProperty]=value
    }
    var styleElement = document.createElement("style");
    styleElement.appendChild(document.createTextNode(`div 
      ::-webkit-scrollbar{width: 17px;height:17px;}
      ::-webkit-scrollbar-thumb{background: #F33320;border-radius: 30px;}
      ::-webkit-scrollbar-track{background: transparent;border-radius: 30px;}`))
    document.getElementsByTagName("head")[0].appendChild(styleElement);
  }
  
  changeScreen(screen,currentTime?){
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="2:33:32"
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
    this.data.duracaoDoFilme = "0:01:01"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }
}
