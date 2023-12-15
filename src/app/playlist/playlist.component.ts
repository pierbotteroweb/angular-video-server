import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/services/common.service';
import { FirebaseService } from '../services/firebase.service';
import { map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { MongodbService } from '../services/mongodb.service';
@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent {
  constructor(
    @Inject(DOCUMENT) private document: any,
    private commonServices: CommonService,
    private firebaseService: FirebaseService,
    private mongodbService: MongodbService,
    private http: HttpClient) { }


  title = 'angular-video-server';
  tempPlaylist:any
  url:any
  exibeVideo:boolean=true
  exibeNumCanal:boolean=true
  numCanal:number=5

  filmesNoite:any
  filmesMadrugada:any
  filmesDublado:any
  filmesComerciais:any
  maldicaodamosca:boolean=false

  tipodeVideo:any="video/mp4"
  indexCurrent:any
  horario:any='noiteFilmes'
  filmeAtual:any
  videoRodando:any
  proximovideo:any
  semana:Array<String>=["domingo","segunda","terca","quarta","quinta","sexta","sabado"]

  proximPlaylist:any
  elem:any
  square:boolean=true

  canal:string='globo'
  fullScreenMode:boolean  
  inicioVideo:any
  fimVideo:any

  listaSemana:any


  videoElement: HTMLVideoElement
  videobar = new FormControl(0)


  mouseMoving:boolean
  pause:boolean=false
  selectedCanal:string
  spySelectedCanal:Subject<string>
  innerWidth:number
  textLogoVisible:boolean=false
  textoAbaixoDoLogo:string=""
  unsubscribe:any

  extensoes:Array<String>=[
    "mp4","m4v","flv","mkv","wmv","webm"
  ]

  @ViewChild ('player') player: ElementRef;

  ngOnInit(){
    // window.location.assign(window.location.href.split("?")[0])
    // console.log(window.location.href)
    // this.exibeLogoETexto()

// let trackerScript = 'console.log("Tracked url:", window.location.href)';
// function trackerJail(){
//   let window = {
//     location: {
//       // put your filtered url here
//       href: "not so fast mr.bond"
//     }
//   }
  
//   eval(String(trackerScript))
    this.innerWidth = window.innerWidth
    this.getCanaisFromMongoDB()
    this.spySelectedCanal = new Subject()
    this.spySelectedCanal.subscribe((canal)=>{
        this.getLista(canal)
    })
    this.getSelectedChanelFromFirebase()
    this.keyboardSetup()
}

// console.log(window.location.href)
// trackerJail()
//     console.log(this.innerWidth)
//   }

  changeChannel(channel){
    console.log(channel)
    this.selectedCanal=channel
    this.firebaseService.updateSeletorDeCanal({canal:channel})
  }

  hideNumCanal(){
    setTimeout(()=>this.exibeNumCanal=false,2000)
  }

  getSelectedChanelFromFirebase(){
    this.firebaseService.getSeletorDeCanal()
    .snapshotChanges()
    .subscribe(change=>{ 
        let canal =  change[0].payload._delegate.doc._document.data.value.mapValue.fields.canal.integerValue   
        canal = canal.toString()
        switch (canal){
          case "1":  
            this.selectCanal(canal.toString(),"Gazeta")
            break
          case "2":  
            this.selectCanal(canal.toString(),"Cultura")
              break
          case "3":
            this.selectCanal(canal.toString(),"Bandeirantes")
              break
          case "4":
            this.selectCanal(canal.toString(),"Sbt")
              break
          case "5":
            this.selectCanal(canal.toString(),"Globo")
              break
          case "6":
            this.selectCanal(canal.toString(),"Mtv")
            break
          case "7":
            this.selectCanal(canal.toString(),"Record")
              break
          case "8":
            console.log("Clear Local Storage")
            localStorage.clear()
              break
          case "9":
            this.selectCanal(canal.toString(),"Manchete")
              break
        }
    },err=>{
      console.log("ERR",err)
    })
  }
  
  keyboardSetup(){

    this.document.addEventListener('keydown',event=>{
      switch (event.code){
        case "Numpad1":
          this.selectCanal(event.code,"Gazeta")
          this.changeChannel(1)
          this.numCanal=11
            break
        case "Numpad2":
          this.selectCanal(event.code,"Cultura")
          this.changeChannel(2)
            break
        case "Numpad3":
          this.selectCanal(event.code,"Bandeirantes")
          this.changeChannel(3)
          this.numCanal=13
            break
        case "Numpad4":
          this.selectCanal(event.code,"Sbt")
          this.changeChannel(4)
            break
        case "Numpad5":
          this.selectCanal(event.code,"Globo")
          this.changeChannel(5)
            break
        case "Numpad6":
          this.selectCanal(event.code,"Mtv")
          this.changeChannel(6)
            break
        case "Numpad7":
          this.selectCanal(event.code,"Record")
          this.changeChannel(7)
            break
        case "Numpad9":
          this.selectCanal(event.code,"Manchete")
          this.changeChannel(9)
            break
        case "Digit1":
          this.selectCanal(event.code,"Gazeta")
          this.changeChannel(1)
          this.numCanal=11
            break
        case "Digit2":
          this.selectCanal(event.code,"Cultura")
          this.changeChannel(2)
            break
        case "Digit3":
          this.selectCanal(event.code,"Bandeirantes")
          this.changeChannel(3)
          this.numCanal=13
            break
        case "Digit4":
          this.selectCanal(event.code,"Sbt")
          this.changeChannel(4)
            break
        case "Digit5":
          this.selectCanal(event.code,"Globo")
          this.changeChannel(5)
            break
        case "Digit6":
          this.selectCanal(event.code,"Mtv")
          this.changeChannel(6)
            break
        case "Digit7":
          this.selectCanal(event.code,"Record")
          this.changeChannel(7)
            break
        case "Digit9":
          this.selectCanal(event.code,"Manchete")
          this.changeChannel(9)
            break
      }
    }) 

  }

  getCanaisFromMongoDB(){
    let dataFromLocalStorage = null;
    
    if(!dataFromLocalStorage){

      this.unsubscribe=
      this.mongodbService.getCanais().subscribe((data:any ) => {
          this.tempPlaylist=data
          // localStorage.setItem('data',JSON.stringify(data))
          // this.selectCanal("5","Globo")
      },err=>{
          console.log("Error ========",err)
      });
      
    } else {
      console.log("Do LocalStorage")
      this.tempPlaylist = JSON.parse(localStorage.getItem('data'))
    }
  }
  
  getLista(selectedCanal){   

        let data = this.tempPlaylist
        let hojeFull = new Date()
        let hoje:any = this.semana[hojeFull.getDay()]
        
        let now = new Date().toLocaleTimeString()
        let sixThiryAm = this.commonServices.toSeconds("06:00:00")
        if(this.commonServices.toSeconds(now)<=sixThiryAm){
          let semanaIndex = hojeFull.getDay()>0?hojeFull.getDay()-1:6
          // semanaIndex = hojeFull.getDay()?semanaIndex:6
          hoje=this.semana[semanaIndex]    
        }
        //hoje = this.semana[6]
        this.listaSemana = data.filter(canal=>canal.emissora==selectedCanal)[0][hoje]
        this.listaSemana.map(prog=>{
          prog.horarioDeExibicaoEmSegundos=
          this.commonServices.toSeconds(prog.horarioDeExibicao)
          if(prog.tipo=="madrugada") prog.tipo="madrugadaFilmes"
          if(prog.tipo=="noite") prog.tipo="noiteFilmes"
        })
        this.listaSemana.sort(this.commonServices.sortPor("horarioDeExibicaoEmSegundos"))
        this.pegaVideoParaRodarPorHorarioDeExibicao()
        let dataFromLocalStorage = localStorage.getItem('data');
        
        if(!dataFromLocalStorage){
          this.unsubscribe.unsubscribe()
        }
  }

  clickPauseMovie(){
    this.pause=!this.pause
    this.pause?this.videoElement.pause():this.videoElement.play()
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

  

  audioBoost(boots:number){

    let myVideoElement = document.getElementsByTagName('video')[0]


      // create an audio context and hook up the video element as the source
      var audioCtx = new AudioContext();
      var source = audioCtx.createMediaElementSource(myVideoElement);

      // create a gain node
      var gainNode = audioCtx.createGain();
      gainNode.gain.value = boots; // double the volume
      source.connect(gainNode);

      // connect the gain node to an output destination
      gainNode.connect(audioCtx.destination);

  }

  selectCanal(text,canal){
    this.numCanal=text.replace("Numpad","").replace("Digit","")
    this.exibeNumCanal=true
    this.hideNumCanal()
    this.spySelectedCanal.next(canal)
    // let filme = canal=='globo'?this.playlistGlobo[0]['novelaGlobo']:this.playlistGlobo
    // let listaIntervalos = canal=='globo'?this.playlistGlobo[0]['novelaGlobo'].intervalos:this.playlistGlobo
  }

  exibeLogoETexto(){
    setTimeout(()=>{
        this.textoAbaixoDoLogo="CLASSE A"
        this.textLogoVisible=true
    },3000)
    setTimeout(()=>{
        this.textLogoVisible=false
    },15000)
    setTimeout(()=>{
        this.textoAbaixoDoLogo="A MALDIÇÃO DA MOSCA"
        this.textLogoVisible=true
    },18000)
    setTimeout(()=>{
        this.textLogoVisible=false
    },30000)
    setTimeout(()=>{
        this.textoAbaixoDoLogo="FINAL"
        this.textLogoVisible=true
    },33000)
    setTimeout(()=>{
        this.textLogoVisible=false
    },48000)
  }

  pegaVideoParaRodarPorHorarioDeExibicao(){
    // this.exibeLogoETexto()
    this.reloadVideo()
    let afterMidnight = false

    let hora = new Date()

    let now = new Date().toLocaleTimeString()
    let searchList = this.listaSemana
    
    this.videoRodando = searchList.filter(videoPararodar=>{
      return this.commonServices.toSeconds(videoPararodar['horarioDeExibicao'])
      <this.commonServices.toSeconds(now)}).reverse()[0]
    
    if(!this.videoRodando){
      this.videoRodando = searchList.filter(videoPararodar=>
        videoPararodar['horarioDeExibicao'].split(":")[0]=="23").reverse()[0]
        afterMidnight=true
    }

      this.setandoParticulares(this.videoRodando.titulo)

    let horaExibicaoVideoRodandoMomento= this.commonServices.toSeconds(this.videoRodando['horarioDeExibicao'])
    
    let inicio =0

    if (afterMidnight){
      inicio = this.commonServices.toSeconds(now)+(this.commonServices.toSeconds("24:00:00")-horaExibicaoVideoRodandoMomento)
    } else {
      inicio = this.commonServices.toSeconds(now)-horaExibicaoVideoRodandoMomento
    }

    if(inicio+this.videoRodando.inicio){

      inicio = inicio+this.videoRodando.inicio

    }

    if(this.videoRodando.tipo!="intervalos"){
      var refreshIntervalId = 
      setInterval(()=>{
          if(this.videoRodando.tipo!="intervalos")inicio++
        if(inicio>this.videoRodando.final){
          clearInterval(refreshIntervalId);
          this.pegaVideoParaRodarPorHorarioDeExibicao()
        }
      },1000)
    }

    this.url= `http://casadopier.ddns.net:5000/assets/${this.videoRodando['tipo']}/${encodeURI(this.videoRodando['titulo'])}#t=${inicio}`

    setTimeout(()=>{
      this.updateAVElements()
    },1100)

  }

  reloadVideo(){
      this.exibeVideo=false
      setTimeout(() => {
      this.exibeVideo=true    
      }, 1000);
  }

  setandoParticulares(nomeDoFilmeAtual){
    

    if(nomeDoFilmeAtual=="Nocturnal Animals 2016.mp4"){
      setTimeout(()=>{
        console.log("Nocturnal Animals 2016.mp4")
  
        this.audioBoost(10)
      },3000)
    }
    
    

    if(nomeDoFilmeAtual=="The Dark Knight 2008.mp4"){
      setTimeout(()=>{
        console.log("The Dark Knight 2008.mp4")
  
        this.audioBoost(10)
      },3000)
    }
    

    if(nomeDoFilmeAtual=="Heat 1995.mp4"){
      setTimeout(()=>{
        console.log("Heat 1995")
  
        this.audioBoost(10)
      },3000)
    }
    

    if(nomeDoFilmeAtual=="The Silence Of The Lambs 1991.mp4"){
      setTimeout(()=>{
        console.log("Heat 1995")
  
        this.audioBoost(10)
      },3000)
    }

    if(nomeDoFilmeAtual=="Dublado - A Maldição da Mosca 1965.mp4"){
      this.maldicaodamosca=true
      this.square=false
    }else if((nomeDoFilmeAtual=="Dublado - Um Jogo de Vida e Morte (Primeiro filme gravado em VHS).webm")||nomeDoFilmeAtual.includes("Doug")){
      this.square=true
      this.maldicaodamosca=false
    }else if(nomeDoFilmeAtual.includes("Alfred Hitchcock - ")){
      this.square=true
      this.maldicaodamosca=false
    }else{
      this.maldicaodamosca=false
      this.square=false
    }
  }

  updateAVElements(){

    if(this.innerWidth>500){
      this.elem = document.documentElement;
      this.videoElement = document.getElementsByTagName('video')[0]
      this.updateVolume(this.videoRodando)
      this.videoElement.addEventListener('mousemove',event=>{
        this.mouseMoving=true
        setTimeout(()=>{
          this.mouseMoving=false
        },500)
      })

    }
  }

  proximo(){
    console.log("func this.próximo")
    setTimeout(()=>{
      this.pegaVideoParaRodarPorHorarioDeExibicao()
    },100)
  }

  updateVolume(infoDeVolDoFilmeAtual){
    if(this.innerWidth>500 && infoDeVolDoFilmeAtual.volume){
      this.videoElement.volume=infoDeVolDoFilmeAtual.volume     

    }
  }

  zapchannel(direction){
    
  }

}
