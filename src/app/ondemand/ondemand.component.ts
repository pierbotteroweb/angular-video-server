import { Component, ViewChild, ElementRef, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PontoDePartidaService } from '../services/ponto-de-partida.service';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/services/common.service';
import { FirebaseService } from '../services/firebase.service';
import { UploadVideoService } from '../services/upload-video.service';
import { map, takeUntil } from 'rxjs/operators';
import { MongodbService } from '../services/mongodb.service';
import { sts } from 'shuffle-tv-services/lib'
import { WebSocketService } from '../services/WebSocketService.service';
import { fromEvent, Observable, Subject, timer } from 'rxjs';

@Component({
  selector: 'app-ondemand',
  templateUrl: './ondemand.component.html',
  styleUrls: ['./ondemand.component.scss']
})
export class OndemandComponent implements OnInit {
  
  constructor(private http: HttpClient,
              @Inject(DOCUMENT) private document: any,
              private pontoDePartidaService: PontoDePartidaService,
              private mongodbService: MongodbService,
              private uploadVideoService: UploadVideoService,
              private webSocketService: WebSocketService,
              private firebaseService: FirebaseService,
              private commonServices: CommonService,
              private formBuilder: FormBuilder) {
                this.selectVideoForm = this.formBuilder.group({ 
                  noiteFilmesFormControl: [""],
                  dubladoFormControl: [""],
                  madrugadaFilmesFormControl: [""],
                  novelasFormControl: [""],
                  originaisFormControl: [""],
                  intervalosFormControl: [""],
                  moviesFormControl: [""],
                  dvdsFormControl: [""],
                  canaisFormControl:[""],
                  programaDeTvFormControl:[""],
                  mimeTypeFormControl:[""]
                })
               }

  baseUrl:string="http://thisisshuffletv/files/assets/"
  baseRequestUrl:string="http://thisisshuffletv/files/"

  title = 'angular-video-server';
  sts = sts;

  pontosDeCorte:any={ }

  modoCadastro:boolean=false

  exibeImg:boolean
  imgUrl:string


  url:any
  exibeVideo:boolean=true

  duracaoVideoSelecionado:number

  ipAdress: any

  videonoiteFilmes:any
  videomadrugadaFilmes:any
  videodublado:any
  videooriginais:any
  videointervalos:any
  videomovies:any
  videodvds:any
  videonovelas:any

  filteredvideonoiteFilmes:any
  filteredvideomadrugadaFilmes:any
  filteredvideodublado:any
  filteredvideooriginais:any
  filteredvideointervalos:any
  filteredvideomovies:any
  filteredvideodvds:any
  filteredvideonovelas:any
  keyboardEvents$:Observable<KeyboardEvent>
  timeBarUpdate$:Observable<number>
  destroy$ = new Subject()

  requests:any = [
    {request:"listaNoite",horario:"noiteFilmes"},
    {request:"listaDublados",horario:"dublado"},
    {request:"listaMadrugada",horario:"madrugadaFilmes"},
    {request:"novelas",horario:"novelas"},
    {request:"listaIntervalos",horario:"intervalos"},
    {request:"listaOriginais",horario:"originais",subs:"listaOriginaisSubs"},
    {request:"listaMovies",horario:"movies",subs:"listaMoviesSubs"},
    {request:"listaDvds",horario:"dvds",subs:"listaDvdsSubs"}
  ]

  mimeType:any="video/mp4"
  indexCurrent:any
  horario:any='noiteFilmes'
  idDofilmeAtual:any
  nomeDoFilmeAtual:any
  proximovideo:any

  proximovideonoiteFilmes:any
  proximovideomadrugadaFilmes:any
  proximovideodublado:any
  proximovideooriginais:any
  proximovideointervalos:any
  proximovideomovies:any
  proximovideodvds:any
  proximovideonovelas:any

  proximPlaylist:any
  elem:any
  maldicaodamosca:boolean=false
  psicose:boolean=false
  square:boolean=true
  subUrl:string=""
  subList:Array<string>=[]
  audioUrl:string
  audioList:Array<string>
  audioExterno:boolean=false
  videoCurrentTime:any
  mouseMoving:boolean
  videoElement: HTMLVideoElement
  audioElement: HTMLAudioElement
  touchStart:number
  touchend:number
  pontoDeCorteSelecionado:any

  selectedCanal:string
  selectedProgramaDeTv:string
  canais: Array<any>
  programaDeTv:Array<any>=[]
  programaDeTvFiltered:Array<any>=[]
  boost:number

  cortesInicio:Array<Object>=[
    {texto:'MACROSS',tempo:"#t=180"},
    {texto:'Zillion',tempo:"#t=96"},
    {texto:'Denver',tempo:"#t=65"},
    {texto:'Transformers',tempo:"#t=30"},
    {texto:'Pirata Do Espaço',tempo:"#t=61"},
    {texto:'Capitão America 1966 -',  tempo:"#t=21"},
    {texto:'A Familia Adams',tempo:"#t=60"},
    {texto:'Thundercats',tempo:"#t=77"},
    {texto:'Mestre dos Sonhos',tempo:"#t=0"},
    {texto:'Volta de Hachiman',tempo:"#t=0"},
    {texto:'Centurions',tempo:"#t=58"},
    {texto:'Homem Aranha 1967',tempo:"#t=64"},
    {texto:'A Familia Adams',tempo:"#t=60"},
    {texto:'Simpsons',tempo:"#t=33"}
  ]

  extensoes:Array<String>=[
    "mp4","m4v","flv","mkv","wmv","webm"
  ]

  selectVideoForm :any
  fullScreenMode:boolean  
  exibeSubList:boolean=false
  pause:boolean=false
  videobar = new FormControl(0)
  audiovolumebar = new FormControl(100)
  audioboostvolumebar = new FormControl(0)
  muteVolume:boolean=false
  filmeRodando:string
  screenOpacity:number
  screenVolume:number
  gainNode:any
  audioCtx:any
  source:any


  get noiteFilmesFormControl() { return this.selectVideoForm('noiteFilmesFormControl') as FormControl}
  get dubladoFormControl() { return this.selectVideoForm('dubladoFormControl') as FormControl}
  get madrugadaFormControl() { return this.selectVideoForm('madrugadaFormControl') as FormControl}
  get novelaFormControl() { return this.selectVideoForm('novelaFormControl') as FormControl}
  get originalFormControl() { return this.selectVideoForm('originalFormControl') as FormControl}
  get movieFormControl() { return this.selectVideoForm('movieFormControl') as FormControl}
  get dvdFormControl() { return this.selectVideoForm('dvdFormControl') as FormControl}

  @ViewChild ('player') player: ElementRef;


  ngOnInit(){
    this.webSocketService.connect('ws://thisisshuffletv:9091');

    // Listen for messages from the server
    this.webSocketService.getMessages().subscribe((message) => {
      let change = JSON.parse(message)
      console.log("Change", change)
      this.getPontoDePartida()
    });


    console.log(window.URL)
    this.boost=1
    this.resetPontosDeCorte()
    this.controleScrollVolumeOpacidadeTablet()
    this.getIpUsuario()
    this.carregandoListasDeVideosDoMongoDB()
    // this.carregandoListasDeVideos()
    this.getPontoDePartida()
    this.avancaERecuaTempoVideoPorTeclado()
    this.getListaDeProgramasDeTvFromMongoDB()
    // this.getListaDeProgramasDeTv()
    this.getCanaisFromMongoDB()

    this.selectVideoForm.get('programaDeTvFormControl')
    .valueChanges.subscribe(value=>{
      if(value){
        this.selectedProgramaDeTv=value
        this.filtrandoListasDeVideos()
      }
    })

    this.selectVideoForm.get('canaisFormControl')
    .valueChanges.subscribe(value=>{
      if(value){
        this.selectedCanal=this.canais.filter(canal=>canal._id==value)[0].emissora
        this.filterProgramaDeTV(this.selectedCanal)
      }
    })
  }

  ngOnDestroy(){
    this.destroy$.next()
    this.destroy$.complete()    
  }

  filterProgramaDeTV(canal){
      this.programaDeTvFiltered=this.programaDeTv.filter(prog=> prog.canal== canal)
  }

  controleScrollVolumeOpacidadeTablet(){

    this.screenOpacity=1
    this.screenVolume=1

    
    this.elem = document.documentElement;

    this.elem.addEventListener('touchstart', event=>{
      this.touchStart= event.touches[0].pageY      
    })

    this.elem.addEventListener('touchend', event=>{
      this.touchend= event.changedTouches[0].pageY

      let valueDiff = (this.touchStart-this.touchend)/this.elem.offsetHeight

      
      if(this.videoElement&&
          event.changedTouches[0].clientX>this.elem.offsetWidth/2&&
          this.videoElement.volume+valueDiff>=0&&
          this.videoElement.volume+valueDiff<=1){

              this.videoElement.volume=
              this.screenVolume= this.videoElement.volume+valueDiff

      } else if(this.videoElement&&
                event.changedTouches[0].clientX<this.elem.offsetWidth/2&&
                this.screenOpacity+valueDiff>=0&&
                this.screenOpacity+valueDiff<=1){

                    this.screenOpacity=this.screenOpacity+valueDiff
      } 
    })

  }

  getIpUsuario(){
    this.pontoDePartidaService.getIPAddress()
    .subscribe(ip=>{
      console.log(ip)
      this.ipAdress = ip['ip']
    })
  }

  getPontoDePartida(){

    this.exibeVideo=false

    this.pontoDePartidaService.getPontoDePartida().subscribe(
      data=>{
        if(data[0].idDoFilme!=""){
          this.mongodbService.getFromVideoCollectionById(data[0].horario,data[0].idDoFilme).subscribe((filme:any)=>{
            console.log("123",data)

            this.audioExterno=false
            this.horario = data[0].horario
            this.idDofilmeAtual = data[0].idDoFilme
            this.nomeDoFilmeAtual = filme.titulo
            sts.updatePageTitle(this.nomeDoFilmeAtual)
            this.duracaoVideoSelecionado = filme.duracao
      
            this.selectVideoForm.get(this.horario+"FormControl").setValue(data[0].idDoFilme)
      
            this.url=this.baseUrl+this.horario+"/"
                      +encodeURI(filme.titulo)+"#t="
                      +(this.definePontoDePartida(filme))
            let infoDoFilmeAtual = {}
            infoDoFilmeAtual['cortesParaIntervalo'] = filme?.cortesParaIntervalo
            infoDoFilmeAtual['corteInicio'] = (filme?.corteInicio?filme.corteInicio:"0")
            infoDoFilmeAtual['corteFinal'] = (filme?.corteFinal?filme.corteFinal:filme.duracao)
            this.updatePontosDeCorte(infoDoFilmeAtual)              
            this.exibeVideo=true
            this.setMediaDoPontoDePartida()
            this.updateAVElements()
            this.timeBarUpdate()   
            
            if(filme?.volume){
  
              setTimeout(()=>{
                this.videoElement.volume=filme?.volume
              },500)
  
            }
            // this.updateVolume(volObj) 
  
            this.setSquare(this.horario)
            this.setandoParticulares(this.nomeDoFilmeAtual)
      
            setTimeout(()=>{        
             this.setSubtitle(filme.titulo,this.horario)
             this.setSubPosition(-4)
            },1000)
          })
        } else {
          this.url = this.baseUrl+"dublado/"+encodeURI("Civic TV, chanel 83.mp4")+"#t=11"
          this.exibeVideo=true
          this.timeBarUpdate()
        }
      }      
    )
  }

  definePontoDePartida(filme): string{

            if(!filme?.pontoDePartida){
              return "0"
            }
            
            if(this.duracaoVideoSelecionado - filme.pontoDePartida < 3){

              if(!filme?.corteInicio){
                return "0"
              }

              return filme.corteInicio
            }

            return filme.pontoDePartida

  }

  carregandoListasDeVideosDoMongoDB(){
    this.requests.map(req=>{
      let lista = "video"+req.horario
      let filtredlista = "filtredvideo"+req.horario
      let unsubscribe=
      this.mongodbService.getFromVideoCollection(req.horario.replace("Filmes","")).subscribe((data:any )=>{ 
        this[lista]=this[filtredlista]=data.sort(sts.sortPorTitulo())
        console.log("lista ",lista)
        console.log(this[lista])

        if(req?.subs){
          this[lista].map(video=>{
            if(video?.sub){
              this.subList.push(video.titulo.replace("mp4","vtt").replace("mkv","vtt").replace("m4v","vtt"))
            }
          })
        }
        unsubscribe.unsubscribe()
      })
    })
  }

  carregandoListasDeVideos(){

    this.requests.map(req=>{
      let lista = "video"+req.horario
      let filtredlista = "filtredvideo"+req.horario
      this.http.get(this.baseRequestUrl+req.request)
      .subscribe((response:any)=>{
        this[lista]=this[filtredlista]=response.data.sort(sts.sortPorTitulo())
      })

      if(req?.subs){
        this.http.get(this.baseRequestUrl+req.subs)
        .subscribe((response:any)=>{
          let listaDeSubs:any= response.data      
          this.subList =this.subList.concat(listaDeSubs) 
        }) 
      }
    })  
  }

  filtrandoListasDeVideos(){
    if(!this.selectedProgramaDeTv || !this.requests) return

    for(const req of this.requests){
      let lista = "video"+req.horario
      let filtredlista = "filtredvideo"+req.horario
      this[filtredlista] = this[lista].filter(prog=>prog.programaDeTv==this.selectedProgramaDeTv)
    }
  }


  setMediaDoPontoDePartida(){
    let infoASerAtualizada={}
        infoASerAtualizada['idDoFilme']=this.idDofilmeAtual
        infoASerAtualizada['horario']=this.horario
        infoASerAtualizada['play']=false
        this.pontoDePartidaService.updatePontoDePartida(infoASerAtualizada).subscribe(x=>{})
        this.updatePontoDePartidaNoVideoNoMongoDBACadaSegundo()
  }
  
  updatePontoDePartidaNoVideoNoMongoDBACadaSegundo(){

    this.updateAVElements()

    setInterval(()=>{
      
      if(this.videoElement){
        this.videoCurrentTime= sts.toTime(this.videoElement.currentTime)
      }
    },1000)

    setInterval(()=>{
      if(this.videoElement){
      let media
      this["video"+[this.horario]].find(video=>{ 
        if(video._id==this.idDofilmeAtual){
            media=video

            let currentTime = this.videoElement.currentTime

            if(this.duracaoVideoSelecionado - this.videoElement.currentTime < 20){
              currentTime = 0
            }

            media['pontoDePartida']=currentTime
    
            this.updateOnMongoDB(media)
          }
        })
      }

    },15000)       
  }

  avancaERecuaTempoVideoPorTeclado(){

    this.keyboardEvents$ = fromEvent<KeyboardEvent>(document,'keydown')

    this.keyboardEvents$.pipe(
          takeUntil(this.destroy$)
        ).subscribe(event=>{
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
        case "NumLock":
          this.posicaoDeTempo('-',0.5)
            break
        case "NumpadDecimal":
          this.posicaoDeTempo('-',1)
            break
        case "Numpad7":
          this.posicaoDeTempo('-',10)
            break
        case "Numpad4":
          this.posicaoDeTempo('-',60)
            break
        case "Numpad1":
          this.posicaoDeTempo('-',600)
            break
        case "NumpadMultiply":
          this.posicaoDeTempo('+',0.5)
            break
        case "NumpadSubtract":
          this.posicaoDeTempo('+',1)
            break
        case "Numpad9":
          this.posicaoDeTempo('+',10)
            break
        case "Numpad6":
          this.posicaoDeTempo('+',60)
            break
        case "Numpad3":
          this.posicaoDeTempo('+',600)
            break
        case "KeyQ":
          this.marcarPontoDeCorte()
            break
        case "KeyM":
          this.salvarPontoDeCorte()
            break
        case "KeyP":
          this.proximoVideoManual()
            break
        case "NumpadDividem":
          this.adicionaPontoDeCorte()
            break
        case "NumpadAdd":
          this.removePontoDeCorte()
            break
        case "KeyO":
          this.selecionaPontoPorTeclado("-")
            break
        case "KeyL":
          this.selecionaPontoPorTeclado("+")
            break
      }
    })

  }

  timeBarUpdate(){

    this.timeBarUpdate$ = timer(500)

    this.timeBarUpdate$.subscribe(time=>{
      this.updateAVElements()        
      this.videoElement.addEventListener('volumechange',event=>{
        this.audiovolumebar.setValue(event.target['volume']*100)  
      })
        
      this.videoElement.addEventListener('mousemove',event=>{
        this.mouseMoving=true
        this.setSubPosition(-30)
        setTimeout(()=>{
          this.mouseMoving=false
        this.setSubPosition(-4)
        },3000)
      })
      this.videoElement.addEventListener('timeupdate',(event)=>{
        this.videobar.setValue((this.videoElement.currentTime/this.duracaoVideoSelecionado)*100)
      })
      
    })
  }
  
  adicionaPontoDeCorte(){
    if(this.pontosDeCorte.cortesParaIntervalo.length<5){
        this.pontosDeCorte.cortesParaIntervalo.push({valor:0,selected:false,left:"left:0px"})
    }
  }

  removePontoDeCorte(){
    if(this.pontosDeCorte.cortesParaIntervalo.length>1){
      this.pontosDeCorte.cortesParaIntervalo.pop()
    }
  }

  marcarPontoDeCorte(){    
    let currentTime = Math.round(this.videoElement.currentTime)

    if(this.pontosDeCorte.corteInicio.selected){
      this.pontosDeCorte.corteInicio.valor=currentTime
      this.pontosDeCorte.corteInicio.left="left:"+
      (Math.round((currentTime/this.duracaoVideoSelecionado)*80)-2)+"vw"
    } else if(this.pontosDeCorte.corteFinal.selected){
      this.pontosDeCorte.corteFinal.valor=currentTime
      this.pontosDeCorte.corteFinal.left="left:"+
      (Math.round((currentTime/this.duracaoVideoSelecionado)*80)-2)+"vw"
    } else {
      this.pontosDeCorte.cortesParaIntervalo.map((pt,ind)=>{
        if(pt.selected){
          this.pontosDeCorte.cortesParaIntervalo[ind].valor=currentTime
          this.pontosDeCorte.cortesParaIntervalo[ind].left="left:"+
          (Math.round((currentTime/this.duracaoVideoSelecionado)*80)-2)+"vw"
        }
      })
    }

    setTimeout(()=>{
      this.selecionaPontoPorTeclado("+")
    },1000)
    
  }

  editarPontoDeCorte(){    
    this.videoElement.currentTime
    
  }

  deletaPontoDeCorte(){
    this.videoElement.currentTime
    
  }

  resetPontosDeCorte(){
    this.pontosDeCorte={
      corteInicio:{valor:0,selected:false,left:"left:0px"},
      cortesParaIntervalo:[{valor:0,selected:false,left:"left:0px"}],
      corteFinal:{valor:0,selected:false,left:"left:0px"}
    }
    
    this.pontoDeCorteSelecionado={
      tipo:"",
      pontoSelecionado:""
    }
    this.selecionaPontoDeCorte('corteInicio')
  }

  setComComerciais(){
    let media 
    this["video"+[this.horario]].find(video=>{ 
      if(video._id==this.idDofilmeAtual){
        media=video
        media['comComerciais']= true
      }
    })

    this.updateOnMongoDB(media)

  }

  salvarPontoDeCorte(){
    let id = this.idDofilmeAtual
    let request = this.requests.find(req=>req.horario==this.horario).request
    let media 
    this["video"+[this.horario]].find(video=>{ 
      if(video._id==this.idDofilmeAtual){
        media=video
        media['corteInicio']= this["video"+[this.horario]].corteInicio = this.pontosDeCorte.corteInicio.valor
        media['corteFinal']= this["video"+[this.horario]].corteFinal = this.pontosDeCorte.corteFinal.valor
        media['cortesParaIntervalo']= this["video"+[this.horario]].cortesParaIntervalo = this.pontosDeCorte.cortesParaIntervalo.map(ponto=>ponto.valor)
      }
    })
    // let lista = this["video"+[this.horario]]
    // let url = "http://thisisshuffletv/files/"+request+"UpdateList"

    // this.firebaseService.update(this.horario,id, media).then(() => {
    //   let unsubscribe = this.uploadVideoService.listUpdate(lista,url)
    //   .subscribe(res=>{
    //     unsubscribe.unsubscribe()
    //   })
    // });

    this.updateOnMongoDB(media)
    
  }

  salvarVolume(){
    let id = this.idDofilmeAtual
    let request = this.requests.find(req=>req.horario==this.horario).request
    let media 
    this["video"+[this.horario]].find(video=>{ 
      if(video._id==this.idDofilmeAtual){
        media=video
        media['volume']= this.videoElement.volume
        media['boost']= this.boost
      }
    })
    let lista = this["video"+[this.horario]]
    let url = "http://thisisshuffletv/files/"+request+"UpdateList"

    // this.firebaseService.update(this.horario,id, media).then(() => {
    //   let unsubscribe = this.uploadVideoService.listUpdate(lista,url)
    //   .subscribe(res=>{
    //     unsubscribe.unsubscribe()
    //   })
    // });

    this.updateOnMongoDB(media)


  }

  updateOnMongoDB(video):void {
    this.mongodbService.updateVideo(video._id,video).subscribe(() => {
      
    });
    
  }

  returnLeft(tempo){

    return "left: "+tempo+36+"px"
  }

  selecionaPontoPorTeclado(direction){
    console.log(this.pontosDeCorte)
    console.log(this.pontoDeCorteSelecionado)
    console.log("direction",direction)

    if(direction=="+"){
      if(this.pontoDeCorteSelecionado.tipo=="corteInicio"){
        
        this.selecionaPontoDeCorte("cortesParaIntervalo",0) 

      } else if(this.pontoDeCorteSelecionado.tipo=="cortesParaIntervalo"&&
                this.pontoDeCorteSelecionado.pontoSelecionado
               <(this.pontosDeCorte.cortesParaIntervalo.length-1)){

        this.selecionaPontoDeCorte("cortesParaIntervalo",
        this.pontoDeCorteSelecionado.pontoSelecionado+1)

      } else if(this.pontoDeCorteSelecionado.tipo=="cortesParaIntervalo"&&
        this.pontoDeCorteSelecionado.pontoSelecionado
        ==(this.pontosDeCorte.cortesParaIntervalo.length-1)){

          this.selecionaPontoDeCorte("corteFinal")

      }
    } else if(direction=="-"){
      if(this.pontoDeCorteSelecionado.tipo=="corteFinal"){

        this.selecionaPontoDeCorte("cortesParaIntervalo",
        this.pontosDeCorte.cortesParaIntervalo.length-1)

      } else if(this.pontoDeCorteSelecionado.tipo=="cortesParaIntervalo"&&
        this.pontoDeCorteSelecionado.pontoSelecionado>0){

        this.selecionaPontoDeCorte("cortesParaIntervalo",
        this.pontoDeCorteSelecionado.pontoSelecionado-1)        

      } else if(this.pontoDeCorteSelecionado.tipo=="cortesParaIntervalo"&&
        this.pontoDeCorteSelecionado.pontoSelecionado==0){

        this.selecionaPontoDeCorte("corteInicio")
        
      }
    }
  }

  selecionaPontoDeCorte(tipo,pontoSelecionado?){
    this.pontoDeCorteSelecionado["tipo"]=tipo
    this.pontoDeCorteSelecionado["pontoSelecionado"]=pontoSelecionado>=0?pontoSelecionado:""
    let currentTime=0
    this.pontosDeCorte.corteInicio.selected=false
    this.pontosDeCorte.corteFinal.selected=false    
    this.pontosDeCorte.cortesParaIntervalo.map((ponto,index)=>{
      this.pontosDeCorte.cortesParaIntervalo[index].selected=false
    })
    if(tipo=="cortesParaIntervalo"){
      this.pontosDeCorte.cortesParaIntervalo[pontoSelecionado].selected=true
      currentTime = this.pontosDeCorte.cortesParaIntervalo[pontoSelecionado].valor
      if(this.pontosDeCorte.cortesParaIntervalo[pontoSelecionado].left!="left:0px"){
        this.videoElement.currentTime = currentTime
      }
    } else {
      this.pontosDeCorte[tipo].selected=true
      currentTime = this.pontosDeCorte[tipo].valor
      if(this.pontosDeCorte[tipo].left!="left:0px"){
        this.videoElement.currentTime = currentTime
      }
    }
  }

  updateAVElements(){    
    this.videoElement = document.getElementsByTagName('video')[0]
    this.audioElement = document.getElementsByTagName('audio')[0]
  }

  proximoVideoManual(){
    this.modoCadastro=false
    this.proximoVideo()
    setTimeout(()=>{
      this.modoCadastro=true
      this.clickPauseMovie()
    },1000)
  }

  proximoVideo(){
    if(!this.modoCadastro){
        this.subUrl=""

          this.exibeVideo=false
          let indexatual = -1
          this['filtredvideo'+this.horario].map((filme,index)=>{
            if(filme._id==this.idDofilmeAtual)
            indexatual=index
          })

          this.duracaoVideoSelecionado= this['filtredvideo'+this.horario][indexatual+1].duracao
          this.url = this.baseUrl+this.horario+"/"+encodeURI(this['filtredvideo'+this.horario][indexatual+1].titulo)
          this.idDofilmeAtual=this['filtredvideo'+this.horario][indexatual+1]._id;
          this.nomeDoFilmeAtual=this['filtredvideo'+this.horario][indexatual+1].titulo;
          sts.updatePageTitle(this.nomeDoFilmeAtual)
          let infoDoFilmeAtual = this['filtredvideo'+this.horario].filter(video=>video._id==this.idDofilmeAtual)[0]
          this.updatePontosDeCorte(infoDoFilmeAtual)        
    
          if(infoDoFilmeAtual?.corteInicio){
            this.url=this.url+"#t="+infoDoFilmeAtual?.corteInicio
          }

        this.selectVideoForm.get(this.horario+"FormControl").setValue(this.idDofilmeAtual)

        
        this.resetForm(this.horario)

        setTimeout(()=>{
          this.exibeVideo=true          
          this.timeBarUpdate()
          this.setSubPosition(-4)
        },100)    

        this.pontoDePartidaService.updatePontoDePartida({
          "idDoFilme":this.idDofilmeAtual,
          "filme":this.nomeDoFilmeAtual,
          "horario":this.horario,
          "duracao":this.getDuracaoVideo(this.idDofilmeAtual,this.horario),
          "horaInicio":0,
          "cortesParaIntervalo":infoDoFilmeAtual?.cortesParaIntervalo,
          "corteInicio":infoDoFilmeAtual?.corteInicio,
          "corteFinal":infoDoFilmeAtual?.corteFinal,
        }).subscribe(data=>{
          console.log("Ponto salvo com sucesso")
        })
        setTimeout(()=>{
          this.updateAVElements()
          this.setandoParticulares(this.nomeDoFilmeAtual)
          this.audiovolumebar.setValue(this.screenVolume)
          this.videoElement.volume=this.screenVolume
        },100)
    }
  }

  videoPausado(){
    this.updateAVElements()
    this.audioElement?.pause()
  }

  videoStartado(){
    this.updateAVElements()
    this.audioElement?.play()
  }

  posicaoDeTempo(direcao,tempo){
    if(direcao=="+"){
      this.videoElement.currentTime += tempo 
    } else {      
    this.videoElement.currentTime -= tempo 
    }
  }



  setSubtitle(filme,horario){

    let subtitle =this.subList.filter(sub=>{
      if(sub.slice(0,-3)==filme?.slice(0,-3)){
        return sub
      }
    })[0]
    this.subUrl = subtitle? this.baseUrl+horario+"/"+encodeURI(subtitle):""
  }

  setSubPosition(position){
    if(this.subUrl){  
        let cues:any  = this.videoElement.textTracks[0].cues;  
        for(let loop=0;loop<=cues.length-1;loop++){
          cues[loop].line= position;  
        }
    }
  }

  getDuracaoVideo(videoId,horario){
    let listaDeVideos = this['filtredvideo'+horario]
    return listaDeVideos.filter(videoDaLista=>videoDaLista._id==videoId)[0].duracao
  }

  updatePontosDeCorte(infoDoFilmeAtual){
    
    if(infoDoFilmeAtual?.cortesParaIntervalo){
        this.pontosDeCorte.cortesParaIntervalo=[]
        infoDoFilmeAtual.cortesParaIntervalo.map(corte=>{
          let leftvw = (Math.round((corte/this.duracaoVideoSelecionado)*80)-2)+"vw"
          this.pontosDeCorte.cortesParaIntervalo.push({valor:corte,selected:false,left:"left:"+leftvw})
        })
        if(infoDoFilmeAtual?.corteInicio){
          let leftvw = (Math.round((infoDoFilmeAtual.corteInicio/this.duracaoVideoSelecionado)*80)-2)+"vw"
          this.pontosDeCorte.corteInicio={valor:infoDoFilmeAtual.corteInicio,selected:false,left:"left:"+leftvw}
        }
    
        if(infoDoFilmeAtual?.corteFinal){
          let leftvw = (Math.round((infoDoFilmeAtual.corteFinal/this.duracaoVideoSelecionado)*80)-2)+"vw"
          this.pontosDeCorte.corteFinal ={valor:infoDoFilmeAtual.corteFinal,selected:false,left:"left:"+leftvw}
        }
    } else {
      this.resetPontosDeCorte()
    }
    
  }

  updateVolume(infoDeVolDoFilmeAtual){
    setTimeout(()=>{
      console.log("infoDeVolDoFilmeAtual",infoDeVolDoFilmeAtual)

      this.videoElement.volume=infoDeVolDoFilmeAtual.volume
      // this.audioBoost(infoDeVolDoFilmeAtual.boost)

    },800)
    
  }

  setandoParticulares(nomeDoFilmeAtual){
    

    if(nomeDoFilmeAtual=="Nocturnal Animals 2016.mp4"){
      setTimeout(()=>{
        console.log("Nocturnal Animals 2016.mp4 TV")
  
        this.audioBoost(2)
      },1000)
    }
    
    

    if(nomeDoFilmeAtual=="The Dark Knight 2008.mp4 TV"){
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
    

    if(nomeDoFilmeAtual=="The Silence Of The Lambs 1991"){
      setTimeout(()=>{
        console.log("Heat 1995")
  
        // this.audioBoost(10)
      },3000)
    }
    

    if(nomeDoFilmeAtual=="No Country For Old Men 2007.mp4"){
      setTimeout(()=>{
        console.log("No Country For Old Men 2007")
  
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


  mudaFilme(idDoFilme,horario){
    let infoDoFilmeAtual = this['filtredvideo'+horario].filter(video=>video._id==idDoFilme)[0]
    console.log("infoDoFilmeAtual ",infoDoFilmeAtual)
    this.updatePontosDeCorte(infoDoFilmeAtual)
    this.nomeDoFilmeAtual = infoDoFilmeAtual.titulo

    this.duracaoVideoSelecionado = this.getDuracaoVideo(idDoFilme,horario)

    let objVol = {}
    objVol['volume']=infoDoFilmeAtual.volume?infoDoFilmeAtual.volume:1
    objVol['boost']=infoDoFilmeAtual.boost?infoDoFilmeAtual.boost:1

    this.updateVolume(objVol)
    
    if(!idDoFilme){
      return
    }
    this.subUrl=""
    this.audioUrl=""
    this.audioExterno=false
    
    this.setSubtitle(this.nomeDoFilmeAtual,horario)

    this.pontoDePartidaService.updatePontoDePartida({
      "idDoFilme":idDoFilme,
      "filme":this.nomeDoFilmeAtual,
      "horario":horario,
      "duracao":this.getDuracaoVideo(idDoFilme,horario),
      "horaInicio":0,
      "cortesParaIntervalo":infoDoFilmeAtual?.cortesParaIntervalo,
      "corteInicio":infoDoFilmeAtual?.corteInicio,
      "corteFinal":infoDoFilmeAtual?.corteFinal,
      "volume":infoDoFilmeAtual?.volume,
      "boost":infoDoFilmeAtual?.boost
    }).subscribe(data=>{
      console.log("Ponto salvo com sucesso")
    })

    this.setandoParticulares(this.nomeDoFilmeAtual)

    this.horario=horario
    this.idDofilmeAtual=idDoFilme
    sts.updatePageTitle(this.nomeDoFilmeAtual)
    this.exibeVideo=false
    if(this.nomeDoFilmeAtual.slice(-3)=="mp4"||this.nomeDoFilmeAtual.slice(-3)
                                      =="mkv"||this.nomeDoFilmeAtual.slice(-3)=="m4v"){
      this.mimeType = "video/mp4"
    } else if(this.nomeDoFilmeAtual.slice(-3)=="wmv"){
      this.mimeType = "video/wmv"
    } else if(this.nomeDoFilmeAtual.slice(-3)=="flv"){
      this.mimeType = "video/flv"
    } else {
      this.mimeType = "video/webm"
    }

    this.url = this.baseUrl+horario+"/"+encodeURI(this.nomeDoFilmeAtual)

    if(infoDoFilmeAtual?.pontoDePartida){
      this.url=this.url+"#t="+infoDoFilmeAtual.pontoDePartida
    }else if(infoDoFilmeAtual?.corteInicio){
      console.log("infoDoFilmeAtual?.corteInicio ",infoDoFilmeAtual.corteInicio)
      this.url=this.url+"#t="+infoDoFilmeAtual.corteInicio
    } else {
      this.cortesInicio.map(video=>{
        if(this.nomeDoFilmeAtual.includes(video['texto'])){
          this.url=this.url+video['tempo']
        }
      })
    }    

    setTimeout(()=>{
      this.exibeVideo=true
      this.timeBarUpdate()
      this.setSubPosition(-4)
    },100)

    this.resetForm(horario)


  }  

  resetForm(formAlterado){    
    Object.keys(this.selectVideoForm.controls).map(control=>{
      if(formAlterado!=control.replace("FormControl","")){
        this.selectVideoForm.get(control).setValue("")
      }
    })
  }

  getListaDeProgramasDeTvFromMongoDB(){
    let unsubscribe=
    this.mongodbService.getListaDeProgramasDeTv()
    .subscribe((data:any)=>{
      if(this.selectedCanal){            
       data = [...data.filter(prog=>{ return prog.canal==this.selectedCanal})]
      }
      this.programaDeTvFiltered=this.programaDeTv=data.sort(sts.sortPorTitulo())
      unsubscribe.unsubscribe()
    })
  }

  getListaDeProgramasDeTv(){
    let unsubscribe=
    this.firebaseService.getAll("programasDeTv").snapshotChanges()
    .pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data=>{
      if(this.selectedCanal){            
       data = [...data.filter(prog=>{ return prog.canal==this.selectedCanal})]
      }
      this.programaDeTvFiltered=this.programaDeTv=data.sort(sts.sortPorTitulo())
      unsubscribe.unsubscribe()
    })
  } 
  
  getCanaisFromMongoDB(){
    let unsubscribe=
    this.mongodbService.getCanais().subscribe((data:any )=>{ 
      this.canais=data.sort(sts.sortPor("canal"))
      console.log("this.canais",this.canais)
      unsubscribe.unsubscribe()
    })

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

  toggleSubsList(){
    this.exibeSubList=!this.exibeSubList
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
  updatevideoVolumeOnBarChange(){
    this.videoElement.volume=this.audiovolumebar.value/100
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

  updatevideoTimeOnBarChange(){
    this.videoElement.currentTime=this.duracaoVideoSelecionado*(this.videobar.value/100)
  }

  clickVideoBar(){
    this.videoElement.currentTime=this.duracaoVideoSelecionado*(this.videobar.value/100)
  }
          
  setSquare(horario){
    if(horario=="novelas"&&horario=="originais"&&horario=="dublado"){
      this.square=true
    }else{
      this.square=false
    }
  }

  setupAudioBoost(){
    let myVideoElement = document.getElementsByTagName('video')[0]

    // create an audio context and hook up the video element as the source
    this.audioCtx = new AudioContext();
    this.source = this.audioCtx.createMediaElementSource(myVideoElement);

    // create a gain node
    this.gainNode = this.audioCtx.createGain();
  }

  audioBoost(boots:number,direction?:string){
    console.log("audioBoost", boots)
    this.videoElement.volume=1

    if(!this.gainNode){      
      this.setupAudioBoost()
    } else {

      if(direction){
        if(direction=="+"){
          this.boost+=1
        } else if(direction=="-"&&this.boost>1) {
          this.boost-=1
        }
      } else {
        this.boost=boots
      }
  
      this.gainNode.gain.value = this.boost;
      // double the volume
      this.source.connect(this.gainNode);
  
      // connect the gain node to an output destination
      this.gainNode.connect(this.audioCtx.destination);

    }

  }

  exibeLogoETexto(){
    setTimeout(()=>{
        this.exibeImg=true
    },3000)
    setTimeout(()=>{
        this.exibeImg=false
    },15091)
    setTimeout(()=>{
        this.exibeImg=true
    },18000)
    setTimeout(()=>{
        this.exibeImg=false
    },30000)
    setTimeout(()=>{
        this.exibeImg=true
    },33000)
    setTimeout(()=>{
        this.exibeImg=false
    },48000)
  }

}
