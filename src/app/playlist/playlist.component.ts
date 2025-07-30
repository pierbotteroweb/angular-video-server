import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { CommonService } from 'src/services/common.service';
import { FirebaseService } from '../services/firebase.service';
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
    private mongodbService: MongodbService) { }


    

  fullCanaisCollection:any
  urlMediaPath:any
  exibirVideo:boolean=true
  exibeNumCanal:boolean=true
  numCanal:number=5

  mimeType:any="video/mp4"
  mediaEmExecucao:any
  diasDaSemana:Array<String>=["domingo","segunda","terca","quarta","quinta","sexta","sabado"]
  domDocumentElement:any
  isFullScreenMode:boolean
  playList:any
  domVideoElement: HTMLVideoElement
  mouseIsMoving:boolean
  videoIsPaused:boolean=false
  selectedCanal:any
  spySelectedCanal:Subject<string>
  windowInnerWidth:number
  textLogoVisible:boolean=false
  textoAbaixoDoLogo:string=""
  unsubscribe:any
  arrayNumerosCanais:Array<any>
  viewport: number

  @ViewChild ('player') player: ElementRef;

  ngOnInit(){
    this.windowInnerWidth = window.innerWidth
    this.viewport = window.innerWidth / window.innerHeight
    this.getCanaisFromMongoDB()
    this.spySelectedCanal = new Subject()
    this.spySelectedCanal.subscribe((canal)=>{
        this.getLista(canal)
    })
    this.keyboardSetup()
  }

  changeChannel(channel){
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

    this.unsubscribe=
    this.mongodbService.getCanais().subscribe((data:any ) => {
        this.fullCanaisCollection=data
        this.arrayNumerosCanais=this.fullCanaisCollection.map(canal=>canal.canal).sort(sts.sortNumbers())
        this.getSelectedChanelFromFirebase()
        this.getSelectedChannelFromMongoDB()
    },err=>{
        console.log("Error ========",err)
    });
  }
  
  getLista(selectedCanal){   

        let dataDeHoje = new Date()
        let diaDaSemanaAtual:any = this.diasDaSemana[dataDeHoje.getDay()]
        
        let now = new Date().toLocaleTimeString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        
        let sixThiryAm = sts.toSeconds("06:00:00")
        if(sts.toSeconds(now)<=sixThiryAm){
          let semanaIndex = dataDeHoje.getDay()>0?dataDeHoje.getDay()-1:6
          diaDaSemanaAtual=this.diasDaSemana[semanaIndex] 
        }
        this.playList = this.fullCanaisCollection.filter(canal=>canal.emissora==selectedCanal)[0][diaDaSemanaAtual]
        this.playList.map(playListNode=>{
          playListNode.horarioDeExibicaoEmSegundos=
          sts.toSeconds(playListNode.horarioDeExibicao)
          if(playListNode.tipo=="madrugada") playListNode.tipo="madrugadaFilmes"
          if(playListNode.tipo=="noite") playListNode.tipo="noiteFilmes"
        })
        this.playList.sort(sts.sortPor("horarioDeExibicaoEmSegundos"))
        this.pegaVideoParaRodarPorHorarioDeExibicao()
  }

  clickPauseMovie(){
    this.videoIsPaused=!this.videoIsPaused
    this.videoIsPaused?this.domVideoElement.pause():this.domVideoElement.play()
  }


  fullScreen(){
    this.isFullScreenMode=!this.isFullScreenMode
    if(this.isFullScreenMode){
      if (this.domDocumentElement.requestFullscreen) {
        this.domDocumentElement.requestFullscreen();
      } else if (this.domDocumentElement.mozRequestFullScreen) {
        this.domDocumentElement.mozRequestFullScreen();
      } else if (this.domDocumentElement.webkitRequestFullscreen) {
        this.domDocumentElement.webkitRequestFullscreen();
      } else if (this.domDocumentElement.msRequestFullscreen) {
        this.domDocumentElement.msRequestFullscreen();
      }   
    } else {
      if(document.exitFullscreen) {
        document.exitFullscreen();
      } 
    }
  }

  selectCanal(text,canal){
    this.numCanal=text.replace("Numpad","").replace("Digit","")
    this.exibeNumCanal=true
    this.hideNumCanal()
    this.spySelectedCanal.next(canal)
  }

  exibeLogoETexto(mediaEmExecucao){
    if(mediaEmExecucao.tipo=="madrugadaFilmes"||mediaEmExecucao.tipo=="noiteFilmes"){
      
      this.textoAbaixoDoLogo=this.commonServices.formatTitle(mediaEmExecucao.titulo)
      this.textLogoVisible=true
      
      setTimeout(()=>{
          this.textoAbaixoDoLogo=mediaEmExecucao.tituloAtracao
          .replace("Corujão Um","Corujão")
          .replace("Corujão Dois","Corujão").toUpperCase()
          this.textLogoVisible=true
      },3000)
      setTimeout(()=>{
          this.textLogoVisible=false
      },15000)
      setTimeout(()=>{
          this.textoAbaixoDoLogo=this.commonServices.formatTitle(mediaEmExecucao.titulo)
          this.textLogoVisible=true
      },18000)
      setTimeout(()=>{
          this.textLogoVisible=false
      },30000)
    }
  }

  pegaVideoParaRodarPorHorarioDeExibicao(){
    this.reloadVideo()
    let afterMidnight = false

    let hora = new Date()

    let now = new Date().toLocaleTimeString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
    let searchList = this.playList
    
    this.mediaEmExecucao = searchList.filter(videoPararodar=>{
      return sts.toSeconds(videoPararodar['horarioDeExibicao'])
      <sts.toSeconds(now)}).reverse()[0]
    
    if(!this.mediaEmExecucao){
      this.mediaEmExecucao = searchList.filter(videoPararodar=>
        videoPararodar['horarioDeExibicao'].split(":")[0]=="23").reverse()[0]
        afterMidnight=true
    }

    let horaExibicaomediaEmExecucaoMomento= sts.toSeconds(this.mediaEmExecucao['horarioDeExibicao'])
    
    let inicio =0

    if (afterMidnight){
      inicio = sts.toSeconds(now)+(sts.toSeconds("24:00:00")-horaExibicaomediaEmExecucaoMomento)
    } else {
      inicio = sts.toSeconds(now)-horaExibicaomediaEmExecucaoMomento
    }

    if(inicio+this.mediaEmExecucao.inicio){

      inicio = inicio+this.mediaEmExecucao.inicio

    }

    if(this.mediaEmExecucao.tipo!="intervalos"){
      var refreshIntervalId = 
      setInterval(()=>{
        if(this.mediaEmExecucao.tipo!="intervalos")inicio++
        if(inicio>this.mediaEmExecucao.final){
          clearInterval(refreshIntervalId);
          this.pegaVideoParaRodarPorHorarioDeExibicao()
        }
      },1000)
    }

    this.urlMediaPath= `http://thisisshuffletv:5091/assets/${this.mediaEmExecucao['tipo']}/${encodeURI(this.mediaEmExecucao['titulo'])}#t=${inicio}`

    setTimeout(()=>{
      this.updateAVElements()
    },1100)

  }

  reloadVideo(){
      this.exibirVideo=false
      setTimeout(() => {
      this.exibirVideo=true    
      }, 1000);
  }

  updateAVElements(){

    if(this.windowInnerWidth>500){
      this.domDocumentElement = document.documentElement;
      this.domVideoElement = document.getElementsByTagName('video')[0]
      this.updateVolume(this.mediaEmExecucao)
      this.domVideoElement.addEventListener('mousemove',event=>{
        this.mouseIsMoving=true
        setTimeout(()=>{
          this.mouseIsMoving=false
        },500)
      })

    }
  }

  proximo(){
    setTimeout(()=>{
      this.pegaVideoParaRodarPorHorarioDeExibicao()
    },100)
  }

  updateVolume(infoDeVolDoFilmeAtual){
    if(this.windowInnerWidth>500 && infoDeVolDoFilmeAtual.volume){
      this.domVideoElement.volume=infoDeVolDoFilmeAtual.volume     

    }
  }

  zapchannel(direction){
    let indexListaDeCanais = this.arrayNumerosCanais.indexOf(this.selectedCanal.toString())
    if(direction=="up"){
      if(indexListaDeCanais==(this.arrayNumerosCanais.length-1)){
        this.selectedCanal=this.arrayNumerosCanais[0]
      } else {
        indexListaDeCanais++
        this.selectedCanal = this.arrayNumerosCanais[indexListaDeCanais]
      }
    } else if(direction=="down"){
      if(indexListaDeCanais==0){
        this.selectedCanal=this.arrayNumerosCanais[this.arrayNumerosCanais.length-1]
      } else {
        indexListaDeCanais--
        this.selectedCanal = this.arrayNumerosCanais[indexListaDeCanais]
      }
    }
    this.switchEventChannel(this.selectedCanal)
  }

}
