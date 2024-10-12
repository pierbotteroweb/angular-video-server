import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-nocturnalanimals2016',
  templateUrl: './nocturnalanimals2016.component.html',
  styleUrls: ['./nocturnalanimals2016.component.scss']
})
export class Nocturnalanimals2016Component implements OnInit {

  constructor(
    
    private commonServices: CommonService
    ) { }
  baseUrl:any="http://thisisshuffletv.zapto.org:1991/api/assets/dvds/"
  elem: any;
  data:any={};

  chapterPoints:any=["00:00:00","00:05:25","00:09:35","00:13:32","00:19:32","00:29:48",
                     "00:34:29","00:39:60","00:45:11","00:52:55","00:59:37","01:04:15",
                     "01:12:49","01:20:03","01:25:11","01:31:53","01:35:23","01:40:48",
                     "01:45:04","01:49:45"]

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
    this.data.dvd="Nocturnal Animals 2016"
    this.subtitlesList=[{idioma:"eng",titulo:"ENG", fileName:"Sub eng"},{idioma:"off",titulo:"OFF", fileName:""}]
    this.data.subtitlesList=this.subtitlesList
    this.chapterPoints= this.chapterPoints.map(point=>{return {"point":point}})
    this.data.duracaoDoFilme="1:56:06"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.menuAudioUrl=this.baseUrl+encodeURI(this.data.dvd)+"/menu.mp3"
    this.setBackgroundImage("mainMenu")
  }
  
  changeScreen(screen,currentTime?){
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme="1:56:06"
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
      if(item['idioma']!="off"&&item['idioma']==sub){
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
    } else if(this.scenePage==4){
      ind=i+13
    } else if(this.scenePage==5){
      ind=i+17
    }
    if(ind<=this.chapterPoints.length){
      return this.baseUrl+encodeURI(this.data.dvd)+"/scene_"+(ind)+".mp4"
    }
  }

  goToScene(i){
    
    // let ind = this.scenePage==1? i+1:i+6
    let ind    
    if(this.scenePage==1){
      ind=i+1
    } else if (this.scenePage==2){
      ind=i+5
    } else if (this.scenePage==3){
      ind=i+9      
    } else if(this.scenePage==4){
      ind=i+13
    } else if(this.scenePage==5){
      ind=i+17
    }

    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+
                  this.commonServices.toSeconds(this.chapterPoints[ind-1]['point'])
    this.playMovie()

  }

  scenePagination(direction){
    if(direction=="up"&&this.scenePage>1){
      this.scenePage--
    }
    if(direction=="down"&&this.scenePage<5){
      this.scenePage++
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
  
  playExtra(extra){
    if(extra=="Trailer"){
      this.data.duracaoDoFilme = "0:02:06"
    } else {
      this.data.duracaoDoFilme = "0:11:19"
    }
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+"/"+extra+".mp4"
    this.menuMode=false
    this.movieMode=true
  }
}
