import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl } from '@angular/forms';
import { CommonService } from 'src/services/common.service';
import { sts } from 'shuffle-tv-services/lib';


@Component({
  selector: 'app-dvd-player',
  templateUrl: './dvd-player.component.html',
  styleUrls: ['./dvd-player.component.scss']
})
export class DvdPlayerComponent implements OnInit {

  constructor(
    private commonServices: CommonService,
    private http: HttpClient,    
    @Inject(DOCUMENT) private document: any
    ) { }
    baseUrl:any="/assets/dvds/"
    elem: any;
    @Input() chapterPoints:Array<any>
    @Input() data:any
    @Output() mainMenu = new EventEmitter();
    
    url:string
    duracaoDoFilme: number
    dvd:string
  
    videobar = new FormControl(0)
    audiovolumebar = new FormControl(100)
    subUrl:string=""
    selectedSubtitle:string=""
    fullScreenMode:boolean  
    muteVolume:boolean=false
    pause:boolean=false
    exibeSubList:boolean=false
    subtitlesList:Array<Object>
    audioList:Array<Object>
    videoElement: HTMLVideoElement
    mouseMoving:boolean
    sts = sts;

  ngOnInit(): void {
    sts.updatePageTitle("DVD - "+this.data.dvd)
    this.fullScreenMode=false
    this.duracaoDoFilme=sts.toSeconds(this.data.duracaoDoFilme)
    this.subtitlesList=this.data.subtitlesList
    this.audioList=(this.data?.audioList)?this.data.audioList:[]
    this.elem = document.documentElement;
    this.url=this.data.url
    this.playMovie()
    this.videoElement = document.getElementsByTagName('video')[0]
    this.elem.addEventListener('touchmove',event=>{
      this.videoElement.volume=(1-event.touches[0].clientY/this.elem.offsetHeight)
    })
    this.videoElement.addEventListener('volumechange',event=>{
      this.audiovolumebar.setValue(event.target['volume']*100)

    })
    this.document.addEventListener('keydown',event=>{
      switch (event.code){
        case "Space":
            this.clickPauseMovie()
            break
        case "ArrowRight":
          this.videoElement.currentTime+=0.5
            break
        case "ArrowLeft":
          this.videoElement.currentTime-=0.5
            break
      }
    })

    if(this.data?.selectedAduioLanguage){ 
      setTimeout(()=>{
        this.setAudioFromPlayer(this.data.selectedAduioLanguage)        
      },1000)
    }
  }

  toggleSubsList(){
    this.exibeSubList=!this.exibeSubList
  }

  updatevideoTimeOnBarChange(){
    this.videoElement.currentTime=this.duracaoDoFilme*(this.videobar.value/100)
  }

  clickVideoBar(){
    this.videoElement.currentTime=this.duracaoDoFilme*(this.videobar.value/100)
  }

  setSubtitleFromPlayer(sub){
    if(sub){
      this.subUrl=this.baseUrl+encodeURI(this.data.dvd)+encodeURI('/'+sub+'.vtt')
    } else {
      this.subUrl=""
    }
    this.setSubPosition()
    this.exibeSubList=false
  }


  setAudioFromPlayer(audio){
    console.log(audio)
    this.videoElement = document.getElementsByTagName('video')[0]
    let currentTime = this.videoElement.currentTime
    let url = this.data.url.split("#")[0]
    if(audio.idioma=="PORT"){
      if(this.data?.nomeDublado){        
      this.url=url.replace("dvds/","/"+audio.tipo+"/Dublado%20-%20").replace(encodeURI(this.data.dvd),encodeURI(this.data.nomeDublado))+"#t="+currentTime
      } else {
        this.url=url.replace("dvds/","/"+audio.tipo+"/Dublado%20-%20")+"#t="+currentTime
      }
    } else {
      this.url=url+"#t="+currentTime
    }
    this.videoElement = document.getElementsByTagName('video')[0]
    this.videoElement.load()

  }

  setSubPosition(){
      setTimeout(()=>{
        let cues:any  = this.videoElement.textTracks[0].cues;  
        for(let loop=0;loop<=cues.length-1;loop++){
          cues[loop].line=-3; 
        }
      },1000)
  }

  fullScreen(){
    this.fullScreenMode=!this.fullScreenMode
    if(this.fullScreenMode){
      if (this.elem.requestFullscreen) {
        this.elem.requestFullscreen();
      } else if (this.elem.mozRequestFullScreen) {
        /* Firefox */
        this.elem.mozRequestFullScreen();
      } else if (this.elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.elem.webkitRequestFullscreen();
      } else if (this.elem.msRequestFullscreen) {
        /* IE/Edge */
        this.elem.msRequestFullscreen();
      }   
    } else {
      if(document.exitFullscreen) {
        document.exitFullscreen();
      } 
    }
  }

  toggleVolume(){
    this.muteVolume=!this.muteVolume

    if(this.muteVolume){
      this.audiovolumebar.setValue(0)
      this.videoElement.volume=0
    } else {
      this.audiovolumebar.setValue(100)
      this.videoElement.volume= this.audiovolumebar.value/100
    }
  }

  playMovie(){
    setTimeout(()=>{
        
      this.videoElement.addEventListener('mousemove',event=>{
        this.mouseMoving=true
        setTimeout(()=>{
          this.mouseMoving=false
        },3000)
      })
      this.videoElement.addEventListener('timeupdate',(event)=>{
        this.videobar.setValue((this.videoElement.currentTime/this.duracaoDoFilme)*100)
      })
    },500)
    this.subUrl=this.data.selectedSubtitle
    this.setSubPosition()
  }
  

  clickScreenMovie(){
    if(this.elem.offsetWidth>1400){
      this.clickPauseMovie()
    }
  }


  clickPauseMovie(){    
    this.pause=!this.pause
    this.pause?this.videoElement.pause():this.videoElement.play()
  }

  clickPlayMovie(){
    this.pause=false
    this.videoElement.play()
  }

  clickNextChapter(){
    let looking=true
    this.chapterPoints.map(chapter=>{
      if(looking&&this.videoElement.currentTime<sts.toSeconds(chapter.point)){
        looking=false
        this.videoElement.currentTime=sts.toSeconds(chapter.point)
      }
    })
    this.videoElement.play()
  }

  clickPreviousChapter(){
    let looking=true
    this.chapterPoints.map((chapter,index)=>{


      if(looking&&this.videoElement.currentTime<sts.toSeconds(chapter.point)){
        looking=false
        this.videoElement.currentTime=sts.toSeconds(this.chapterPoints[index-2].point)
      } 
      
      if (looking&&this.chapterPoints.length-1==index){
        looking=false
        this.videoElement.currentTime=sts.toSeconds(this.chapterPoints[index-1].point)
      } 
      
    })
    this.videoElement.play()
  }

  updatevideoVolumeOnBarChange(){  
    this.videoElement.volume=this.audiovolumebar.value/100
  }

  goToMain(){
    this.mainMenu.emit(this.videoElement.currentTime)
  }
}
