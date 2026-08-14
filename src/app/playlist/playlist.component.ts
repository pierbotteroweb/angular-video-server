import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { CommonService } from 'src/services/common.service';
import { fromEvent, Observable, Subject, interval } from 'rxjs';
import { MongodbService } from '../services/mongodb.service';
import { sts } from 'shuffle-tv-services/lib'
import { takeUntil } from 'rxjs/operators';
import { WebSocketService } from '../services/WebSocketService.service';
@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent {
  constructor(
    private commonServices: CommonService,
    private mongodbService: MongodbService,
    private webSocketService: WebSocketService) { }

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
  inicioMediaEmSegundos:number=0
  seekAplicado:boolean=false
  autoplayMuted:boolean=false
  selectedCanal:any
  spySelectedCanal:Subject<string>
  windowInnerWidth:number
  textLogoVisible:boolean=false
  textoAbaixoDoLogo:string=""
  unsubscribe:any
  arrayNumerosCanais:Array<string> = ["2","4","5","7","9","11","13","32","42"]
  viewport: number
  keyboardEvents$: Observable<KeyboardEvent>
  destroy$ = new Subject()
  selectedChannelPollingInterval = 1000

  @ViewChild ('player') player: ElementRef;

  ngOnInit(){
    this.windowInnerWidth = window.innerWidth
    this.viewport = window.innerWidth / window.innerHeight
    this.spySelectedCanal = new Subject()
    this.spySelectedCanal.subscribe((canal)=>{
        this.getLista(canal)
    })
    this.listenSelectedChannelFromMongoDBChanges()
    this.startSelectedChannelPolling()
    this.getSelectedChannelFromMongoDB()
    this.keyboardSetup()
  }

  ngOnDestroy(){
    this.destroy$.next()
    this.destroy$.complete()
  }

  changeChannel(channel){
    let canalInfo = this.aplicarCanalSelecionado(channel)

    if(!canalInfo){
      return
    }

    this.mongodbService.updateSeletorDeCanal({canal:canalInfo.numero}).subscribe()
  }

  listenSelectedChannelFromMongoDBChanges(){
    this.webSocketService.connect('/mongodb');

    this.webSocketService.getMessages().pipe(
      takeUntil(this.destroy$)
    ).subscribe(()=>{
      this.getSelectedChannelFromMongoDB()
    })
  }

  startSelectedChannelPolling(){
    interval(this.selectedChannelPollingInterval).pipe(
      takeUntil(this.destroy$)
    ).subscribe(()=>{
      this.getSelectedChannelFromMongoDB()
    })
  }

  hideNumCanal(){
    setTimeout(()=>this.exibeNumCanal=false,2000)
  }

  getSelectedChannelFromMongoDB(){
    this.mongodbService.getSeletorDeCanal()
    .subscribe(data=>{
      let canal = data[0].canal.toString()
      let canalInfo = this.getCanalInfo(canal)

      if(!canalInfo){
        return
      }

      if(this.selectedCanal && this.selectedCanal.toString() == canalInfo.numero){
        return
      }

      this.aplicarCanalSelecionado(canal)
    })
  
  }
  
  keyboardSetup(){
    let enteredDigitsString =""

    this.keyboardEvents$ = fromEvent<KeyboardEvent>(document,'keydown')
    this.keyboardEvents$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(event=>{
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
    this.changeChannel(eventCode)
  }

  getCanalInfo(canal){
    switch (canal.toString()){
      case "1":
      case "11":
        return {numero:"11", emissora:"Gazeta"}
      case "2":
        return {numero:"2", emissora:"Cultura"}
      case "3":
      case "13":
        return {numero:"13", emissora:"Bandeirantes"}
      case "4":
        return {numero:"4", emissora:"Sbt"}
      case "5":
        return {numero:"5", emissora:"Globo"}
      case "6":
      case "32":
        return {numero:"32", emissora:"Mtv"}
      case "7":
        return {numero:"7", emissora:"Record"}
      case "9":
        return {numero:"9", emissora:"Manchete"}
      case "42":
        return {numero:"42", emissora:"TVA"}
    }
  }

  aplicarCanalSelecionado(canal){
    let canalInfo = this.getCanalInfo(canal)

    if(!canalInfo){
      return false
    }

    this.selectCanal(canalInfo.numero, canalInfo.emissora)
    return canalInfo
  }

  getGradeFromMongoDB(emissora,diasDaSemana){
    this.mongodbService.getGrade(emissora,diasDaSemana).subscribe((data:any)=>{
      let horarioDeExibicaoAtualizado = ""
      let duracaoEmSegundosDoProgramaAnterior = 0

      let dataComHotarioDeExibicao = data.map(corte=>{

        if(horarioDeExibicaoAtualizado == ""){
          horarioDeExibicaoAtualizado = "06:30:00"
        } else {
          horarioDeExibicaoAtualizado = sts.toTime(sts.toSeconds(horarioDeExibicaoAtualizado) + duracaoEmSegundosDoProgramaAnterior)        
        }

        if (sts.toSeconds(horarioDeExibicaoAtualizado) > sts.toSeconds("23:59:59")){
          horarioDeExibicaoAtualizado = sts.toTime(sts.toSeconds(horarioDeExibicaoAtualizado) - sts.toSeconds("24:00:00"))
        }

        duracaoEmSegundosDoProgramaAnterior = corte.duracaoTotalDaAtracaoEmSegundos

        let { tipo:tipoDoCorte } = corte

        if (tipoDoCorte == "noite" || tipoDoCorte == "madrugada" ){
          tipoDoCorte = tipoDoCorte + "Filmes"
        }

        return {...corte,
                horarioDeExibicao:horarioDeExibicaoAtualizado,
                tipo:tipoDoCorte,
                horarioDeExibicaoEmSegundos:sts.toSeconds(horarioDeExibicaoAtualizado)}
      })

      let dataFinal = dataComHotarioDeExibicao.sort(sts.sortPor("horarioDeExibicaoEmSegundos"))

      this.playList = dataFinal

      this.pegaVideoParaRodarPorHorarioDeExibicao()
    })
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
        this.getGradeFromMongoDB(selectedCanal,diaDaSemanaAtual)
  }

  clickPauseMovie(){
    this.videoIsPaused=!this.videoIsPaused
    if(this.videoIsPaused){
      this.domVideoElement.pause()
    } else {
      this.autoplayMuted=false
      this.domVideoElement.muted=false
      this.tentarIniciarVideo()
    }
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
    this.selectedCanal=this.numCanal
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
      return sts.toSeconds(videoPararodar['horarioDeExibicao']) < sts.toSeconds(now)}).reverse()[0]
    
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

    this.inicioMediaEmSegundos = Math.max(0, Math.floor(inicio))
    this.seekAplicado = false
    this.videoIsPaused = false
    this.autoplayMuted = false
    this.urlMediaPath= `/files/assets/${this.mediaEmExecucao['tipo']}/${encodeURI(this.mediaEmExecucao['titulo'])}`

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
      this.aplicarTempoInicialCompativelComSmartTv()
      this.tentarIniciarVideo()
      this.domVideoElement.addEventListener('mousemove',event=>{
        this.mouseIsMoving=true
        setTimeout(()=>{
          this.mouseIsMoving=false
        },500)
      })

    }
  }

  aplicarTempoInicialCompativelComSmartTv(){
    if(!this.domVideoElement || this.seekAplicado){
      return
    }

    let tempoInicial = this.inicioMediaEmSegundos || 0

    if(tempoInicial <= 0){
      this.seekAplicado = true
      this.tentarIniciarVideo()
      return
    }

    let aplicarSeek = () => {
      if(this.seekAplicado || !this.domVideoElement){
        return
      }

      try {
        this.domVideoElement.currentTime = tempoInicial
        this.seekAplicado = true
        this.tentarIniciarVideo()
      } catch (error) {
        setTimeout(()=>aplicarSeek(),500)
      }
    }

    if(this.domVideoElement.readyState >= 1){
      aplicarSeek()
    } else {
      this.domVideoElement.addEventListener('loadedmetadata', aplicarSeek)
      this.domVideoElement.addEventListener('canplay', aplicarSeek)
    }
  }

  tentarIniciarVideo(){
    if(!this.domVideoElement || this.videoIsPaused){
      return
    }

    let playPromise = this.domVideoElement.play()

    if(playPromise && playPromise.catch){
      playPromise.catch(()=>{
        this.autoplayMuted=true
        this.domVideoElement.muted=true

        let mutedPlayPromise = this.domVideoElement.play()
        if(mutedPlayPromise && mutedPlayPromise.catch){
          mutedPlayPromise.catch(()=>{})
        }
      })
    }
  }

  proximo(){
    setTimeout(()=>{
      this.pegaVideoParaRodarPorHorarioDeExibicao()
    },100)
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
