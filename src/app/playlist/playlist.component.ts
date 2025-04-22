import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/services/common.service';
import { FirebaseService } from '../services/firebase.service';
import { map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { MongodbService } from '../services/mongodb.service';
import { sts } from 'shuffle-tv-services/lib'
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
  selectedCanal:any
  spySelectedCanal:Subject<string>
  innerWidth:number
  textLogoVisible:boolean=false
  textoAbaixoDoLogo:string=""
  unsubscribe:any
  listaDeNumerosDeCanais:Array<any>

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
    this.mongodbService.updateSeletorDeCanal({canal:channel}).subscribe(() => {
      console.log('Selected Canal updated successfully!');
    })
  }

  hideNumCanal(){
    setTimeout(()=>this.exibeNumCanal=false,2000)
  }

  getSelectedChannelFromMongoDB(){
    this.mongodbService.getSeletorDeCanal()
    .subscribe(data=>{
      let canal = data[0].canal.toString()
      console.log("getSelectedChannelFromMongoDB data",canal)
      console.log("getSelectedChannelFromMongoDB data",typeof(canal))
      this.selectedCanal = canal
      switch (canal){
        case "2":  
          this.selectCanal(canal.toString(),"Cultura")
            break
        case "4":
          this.selectCanal(canal.toString(),"Sbt")
            break
        case "5":
          this.selectCanal(canal.toString(),"Globo")
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
        case "11":  
          this.selectCanal(canal.toString(),"Gazeta")
          break
        case "13":
          this.selectCanal(canal.toString(),"Bandeirantes")
            break
        case "32":
          this.selectCanal(canal.toString(),"Mtv")
          break
      }
    })
  
  }

  getSelectedChanelFromFirebase(){
    this.firebaseService.getSeletorDeCanal()
    .snapshotChanges()
    .subscribe(change=>{ 
        let canal =  change[0].payload._delegate.doc._document.data.value.mapValue.fields.canal.integerValue   
        canal = canal.toString()
        this.selectedCanal = canal
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
    let enteredDigitsString =""

    this.document.addEventListener('keydown',event=>{
      let stringsToRemoveArrows = ["Arrow","Page"]
      let stringsToRemoveNumbers = ["Digit","Numpad"]
      if(stringsToRemoveArrows.find(i=>event.code.includes(i))){
        this.zapchannel(sts.removeFromString(stringsToRemoveArrows,event.code).toLowerCase())
      }
      if(stringsToRemoveNumbers.find(i=>event.code.includes(i))){
       
        if(event.code) enteredDigitsString += sts.removeFromString(stringsToRemoveNumbers,event.code)
        this.numCanal=parseInt(enteredDigitsString.slice(0,2))
        this.exibeNumCanal=true
        setTimeout(()=>{
          this.switchEventChannel(enteredDigitsString.slice(0,2))
          enteredDigitsString=""
        },2000)
      }
    }) 
  }

  switchEventChannel(eventCode:any){
    eventCode=sts.removeFromString(["Digit","Numpad"],eventCode.toString())
    switch (eventCode){
      case "1":
        this.selectCanal(eventCode,"Gazeta")
        this.changeChannel(1)
        this.numCanal=11
          break
      case "2":
        this.selectCanal(eventCode,"Cultura")
        this.changeChannel(2)
          break
      case "3":
        this.selectCanal(eventCode,"Bandeirantes")
        this.changeChannel(3)
        this.numCanal=13
          break
      case "4":
        this.selectCanal(eventCode,"Sbt")
        this.changeChannel(4)
          break
      case "5":
        this.selectCanal(eventCode,"Globo")
        this.changeChannel(5)
          break
      case "6":
        this.selectCanal(eventCode,"Mtv")
        this.changeChannel(6)
          break
      case "7":
        this.selectCanal(eventCode,"Record")
        this.changeChannel(7)
          break
      case "9":
        this.selectCanal(eventCode,"Manchete")
        this.changeChannel(9)
          break
      case "11":
        this.selectCanal(eventCode,"Gazeta")
        this.changeChannel(11)
          break
      case "13":
        this.selectCanal(eventCode,"Bandeirantes")
        this.changeChannel(13)
          break
      case "32":
        this.selectCanal(eventCode,"Mtv")
        this.changeChannel(32)
          break
    }

  }

  getCanaisFromMongoDB(){
    let dataFromLocalStorage = null;
    
    if(!dataFromLocalStorage){

      this.unsubscribe=
      this.mongodbService.getCanais().subscribe((data:any ) => {
          this.tempPlaylist=data
          this.listaDeNumerosDeCanais=this.tempPlaylist.map(canal=>canal.canal).sort(sts.sortNumbers())
          this.getSelectedChanelFromFirebase()
          this.getSelectedChannelFromMongoDB()
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
        let sixThiryAm = sts.toSeconds("06:00:00")
        if(sts.toSeconds(now)<=sixThiryAm){
          let semanaIndex = hojeFull.getDay()>0?hojeFull.getDay()-1:6
          // semanaIndex = hojeFull.getDay()?semanaIndex:6
          hoje=this.semana[semanaIndex]    
        }
        //hoje = this.semana[6]
        this.listaSemana = data.filter(canal=>canal.emissora==selectedCanal)[0][hoje]
        this.listaSemana.map(prog=>{
          prog.horarioDeExibicaoEmSegundos=
          sts.toSeconds(prog.horarioDeExibicao)
          if(prog.tipo=="madrugada") prog.tipo="madrugadaFilmes"
          if(prog.tipo=="noite") prog.tipo="noiteFilmes"
        })
        this.listaSemana.sort(sts.sortPor("horarioDeExibicaoEmSegundos"))
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

  exibeLogoETexto(videoRodando){
    if(videoRodando.tipo=="madrugadaFilmes"||videoRodando.tipo=="noiteFilmes"){
      console.log("Video Rodando: ",videoRodando)
      
      this.textoAbaixoDoLogo=this.commonServices.formatTitle(videoRodando.titulo)
      this.textLogoVisible=true
      
      setTimeout(()=>{
          this.textoAbaixoDoLogo=videoRodando.tituloAtracao
          .replace("Corujão Um","Corujão")
          .replace("Corujão Dois","Corujão").toUpperCase()
          this.textLogoVisible=true
      },3000)
      setTimeout(()=>{
          this.textLogoVisible=false
      },15000)
      setTimeout(()=>{
          this.textoAbaixoDoLogo=this.commonServices.formatTitle(videoRodando.titulo)
          this.textLogoVisible=true
      },18000)
      setTimeout(()=>{
          this.textLogoVisible=false
      },30000)
      // setTimeout(()=>{
      //     this.textoAbaixoDoLogo="FINAL"
      //     this.textLogoVisible=true
      // },33000)
      // setTimeout(()=>{
      //     this.textLogoVisible=false
      // },48000)
    }
  }

  pegaVideoParaRodarPorHorarioDeExibicao(){
    this.reloadVideo()
    let afterMidnight = false

    let hora = new Date()

    let now = new Date().toLocaleTimeString()
    let searchList = this.listaSemana
    
    this.videoRodando = searchList.filter(videoPararodar=>{
      return sts.toSeconds(videoPararodar['horarioDeExibicao'])
      <sts.toSeconds(now)}).reverse()[0]
    
    if(!this.videoRodando){
      this.videoRodando = searchList.filter(videoPararodar=>
        videoPararodar['horarioDeExibicao'].split(":")[0]=="23").reverse()[0]
        afterMidnight=true
    }

      this.setandoParticulares(this.videoRodando.titulo)

    let horaExibicaoVideoRodandoMomento= sts.toSeconds(this.videoRodando['horarioDeExibicao'])
    
    let inicio =0

    if (afterMidnight){
      inicio = sts.toSeconds(now)+(sts.toSeconds("24:00:00")-horaExibicaoVideoRodandoMomento)
    } else {
      inicio = sts.toSeconds(now)-horaExibicaoVideoRodandoMomento
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

    this.url= `http://thisisshuffletv:5091/assets/${this.videoRodando['tipo']}/${encodeURI(this.videoRodando['titulo'])}#t=${inicio}`

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
  
        // this.audioBoost(10)
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
    let indexListaDeCanais = this.listaDeNumerosDeCanais.indexOf(this.selectedCanal.toString())
    if(direction=="up"){
      if(indexListaDeCanais==(this.listaDeNumerosDeCanais.length-1)){
        this.selectedCanal=this.listaDeNumerosDeCanais[0]
      } else {
        indexListaDeCanais++
        this.selectedCanal = this.listaDeNumerosDeCanais[indexListaDeCanais]
      }
    } else if(direction=="down"){
      if(indexListaDeCanais==0){
        this.selectedCanal=this.listaDeNumerosDeCanais[this.listaDeNumerosDeCanais.length-1]
      } else {
        indexListaDeCanais--
        this.selectedCanal = this.listaDeNumerosDeCanais[indexListaDeCanais]
      }
    }
    this.switchEventChannel(this.selectedCanal)
  }

}
