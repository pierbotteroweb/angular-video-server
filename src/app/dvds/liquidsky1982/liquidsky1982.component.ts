import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-liquidsky1982',
  templateUrl: './liquidsky1982.component.html',
  styleUrls: ['./liquidsky1982.component.scss']
})
export class Liquidsky1982Component implements OnInit {

  constructor(    
    private commonServices: CommonService
    ) { }
  baseUrl:any="http://thisisshuffletv.zapto.org:1991/api/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=["00:00:00","00:05:13","00:16:13","00:27:14","00:38:15",
                     "00:49:16","01:00:16","01:11:17","01:23:48","01:35:48"]

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
  scenePage:number
  currentVideoTime:any


  ngOnInit(): void {
    this.currentVideoTime=0
    this.scenePage=1
    this.data.dvd="Liquid Sky 1982"
    this.subtitlesList=[{idioma:"ENG", fileName:"Sub"},{idioma:"OFF", fileName:""}]
    this.data.subtitlesList=this.subtitlesList
    this.chapterPoints= this.chapterPoints.map(point=>{return {"point":point}})
    this.data.duracaoDoFilme="1:51:35"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
    this.setBackgroundImage("mainMenu")
  }
  
  changeScreen(screen,currentTime?){
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="1:51:35"
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
    let ind    
    if(this.scenePage==1){
      ind=i+1
    } else if (this.scenePage==2){
      ind=i+5
    } else if (this.scenePage==3){
      ind=i+9      
    }
    if(ind<=this.chapterPoints.length){
      return this.baseUrl+encodeURI(this.data.dvd)+"/scene_"+(ind)+".mp4"
    }
  }

  goToScene(i){
    let ind    
    if(this.scenePage==1){
      ind=i+1
    } else if (this.scenePage==2){
      ind=i+5
    } else if (this.scenePage==3){
      ind=i+9      
    }

    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+
                  this.commonServices.toSeconds(this.chapterPoints[ind-1]['point'])
    this.playMovie()
  }

  scenePagination(direction){
    if(direction=="down"&&this.scenePage<3){
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
    this.data.duracaoDoFilme = "0:01:46"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/Trailer.mp4"
    this.menuMode=false
    this.movieMode=true
  }
}
