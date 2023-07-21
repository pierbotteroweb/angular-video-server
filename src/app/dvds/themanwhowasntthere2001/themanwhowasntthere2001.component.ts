import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/services/common.service';


@Component({
  selector: 'app-themanwhowasntthere2001',
  templateUrl: './themanwhowasntthere2001.component.html',
  styleUrls: ['./themanwhowasntthere2001.component.scss']
})
export class Themanwhowasntthere2001Component implements OnInit {

  constructor(
    private commonServices: CommonService,
    private http: HttpClient,
    @Inject(DOCUMENT) private document: any
  ) { }
  baseUrl: any = "http://casadopier.ddns.net:1984/api/assets/dvds/"
  elem: any;
  data: any = {};

  chapterPoints: any = [["00:00:06", "00:10:30", "00:25:17", "00:35:29"],
                        ["00:44:44", "00:48:25", "1:03:36", "1:05:54"],
                        ["1:11:22", "1:16:01", "1:20:18", "1:25:21"]]
  
  selectedChapterPoints:any=[]
  scenePages:Array<string>

  url: string
  backgroundMenuUrl: any
  menuAudioUrl: string

  exibeVideo: boolean = true
  movieMode: boolean = false
  menuMode: boolean = false

  subUrl: string = ""
  selectedSubtitle: string = ""
  subList: Array<string>
  subtitlesList:Array<Object>

  selectedScreen: string
  backgroundMenu: any
  urlBioPic: string
  scenePage: number
  currentVideoTime:any



  ngOnInit(): void {
    this.currentVideoTime=0
    this.scenePage = 0
    this.selectedChapterPoints= this.chapterPoints[this.scenePage]
    this.scenePages=["1-4","6-8","9-12"]
    this.subtitlesList=[{idioma:"Port",titulo:"portugues", fileName:"Sub"},{idioma:"OFF",titulo:"sem legenda", fileName:""}]
    this.data.subtitlesList=this.subtitlesList
    this.data.dvd="The Man Who Wasnt There 2001"
    this.data.duracaoDoFilme = "1:36:11"
    this.data.url=this.baseUrl+encodeURI(this.data.dvd)+".mp4#t="+this.currentVideoTime
    this.elem = document.documentElement;
    this.setBackgroundImage("mainMenu")
  }

  changeScreen(screen,currentTime?) {
    if(currentTime){
      this.currentVideoTime=currentTime
    }
    this.data.duracaoDoFilme = "1:36:11"
    this.menuMode = true
    this.movieMode = false
    this.selectedScreen = screen
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

  returnSceneUrl(i) {
    let ind 
    if(this.scenePage==0){
      ind=i+1
    } else if(this.scenePage==1){
      ind=i+5
    } else {
      ind = i+9
    }
    return this.baseUrl + encodeURI(this.data.dvd) + "/scene_" + (ind) + ".mp4"
  }

  goToScene(i) {
    this.data.url = this.baseUrl + encodeURI(this.data.dvd) + ".mp4#t=" +
    this.commonServices.toSeconds(this.chapterPoints[this.scenePage][i])
    this.playMovie()
  }

  scenePagination(i) {
    this.scenePage = i
    this.selectedChapterPoints= this.chapterPoints[i]
  }
  

  setBackgroundImage(menu) {
    this.menuMode = false
    this.backgroundMenuUrl = this.baseUrl + encodeURI(this.data.dvd) + "/" + menu + ".jpg"
    console.log(this.backgroundMenuUrl)
    this.backgroundMenu = "background-image: url('" + this.backgroundMenuUrl + "')"
    console.log(this.backgroundMenu)
    this.selectedScreen = menu
    this.menuMode = true
  }

  playMovie() {
    this.menuMode = false
    this.movieMode = true
  }

  playExtra(extra) {
    if(extra=="Trailer"){
      this.data.duracaoDoFilme = "0:02:25"
    } else {
      this.data.duracaoDoFilme = "0:32:54"
    }
    this.data.url = this.baseUrl + encodeURI(this.data.dvd)+"/"+extra+".mp4"
    this.menuMode = false
    this.movieMode = true
  }
}

