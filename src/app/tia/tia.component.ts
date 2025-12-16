import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PontoDePartidaService } from '../services/ponto-de-partida.service';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/services/common.service';
import { FirebaseService } from '../services/firebase.service';
import { UploadVideoService } from '../services/upload-video.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tia',
  templateUrl: './tia.component.html',
  styleUrls: ['./tia.component.scss']
})
export class TiaComponent{

  
  constructor(private http: HttpClient,
              @Inject(DOCUMENT) private document: any,
              private pontoDePartidaService: PontoDePartidaService,
              private uploadVideoService: UploadVideoService,
              private firebaseService: FirebaseService,
              private commonServices: CommonService,
              private formBuilder: FormBuilder) {
                this.selectVideoForm = this.formBuilder.group({ 
                  noiteFilmesFormControl: [""]   
                })
               }

  baseUrl:string="http://shuffletv.ddns.net:1984/api/assets/"
  baseRequestUrl:string="http://shuffletv.ddns.net:1984/api/"

  title = 'angular-video-server';

  pontosDeCorte:any={ }

  modoCadastro:boolean=false


  url:any
  exibeVideo:boolean=true

  duracaoVideoSelecionado:number

  ipAdress: any

  videoFilmesDaTia:any
  videomadrugadaFilmes:any
  videodublado:any
  videooriginais:any
  videomovies:any
  videodvd:any
  videonovelas:any

  requests:any = [
    {request:"listaNoite",horario:"noiteFilmes"},
    {request:"listaDublados",horario:"dublado"},
    {request:"listaMadrugada",horario:"madrugadaFilmes"},
    {request:"novelas",horario:"novelas"},
    {request:"listaOriginais",horario:"originais",subs:"listaOriginaisSubs"},
    {request:"listaMovies",horario:"movies",subs:"listaMoviesSubs"},
    {request:"listaDvds",horario:"dvd",subs:"listaDvdsSubs"}
  ]

  tipodeVideo:any="video/mp4"
  indexCurrent:any
  horario:any='noiteFilmes'
  idDofilmeAtual:any
  nomeDoFilmeAtual:any

  proximPlaylist:any
  elem:any
  maldicaodamosca:boolean=false
  psicose:boolean=false
  square:boolean=true
  subList:Array<string>=[]
  audioList:Array<string>
  videoCurrentTime:any
  mouseMoving:boolean
  videoElement: HTMLVideoElement
  audioElement: HTMLAudioElement
  touchStart:number
  touchend:number

  extensoes:Array<String>=[
    "mp4","m4v","flv","mkv","wmv","webm"
  ]

  selectVideoForm :any
  fullScreenMode:boolean  
  exibeSubList:boolean=false
  pause:boolean=false
  videobar = new FormControl(0)
  audiovolumebar = new FormControl(100)
  muteVolume:boolean=false
  filmeRodando:string
  screenOpacity:number
  screenVolume:number

  get noiteFilmesFormControl() { return this.selectVideoForm('noiteFilmesFormControl') as FormControl}

  @ViewChild ('player') player: ElementRef;


  ngOnInit(){
    this.getList()
  } 

  selecionaFilme(idDoFilme){
    let infoDoFilmeAtual = this.videoFilmesDaTia.filter(video=>video.id==idDoFilme)[0]
    let horario = infoDoFilmeAtual.tipo
    console.log("idDoFilme ",idDoFilme)
    console.log("infoDoFilmeAtual ",infoDoFilmeAtual)
    this.nomeDoFilmeAtual = infoDoFilmeAtual.titulo

    this.duracaoVideoSelecionado = this.getDuracaoVideo(idDoFilme)
    
    if(!idDoFilme){
      return
    }
    
    // this.setSubtitle(this.nomeDoFilmeAtual,horario)

    this.horario=horario
    this.idDofilmeAtual=idDoFilme
    this.commonServices.updatePageTitle(this.nomeDoFilmeAtual)
    this.exibeVideo=false
    if(this.nomeDoFilmeAtual.slice(-3)=="mp4"||this.nomeDoFilmeAtual.slice(-3)=="mkv"||this.nomeDoFilmeAtual.slice(-3)=="m4v"){
      this.tipodeVideo = "video/mp4"
    } else if(this.nomeDoFilmeAtual.slice(-3)=="wmv"){
      this.tipodeVideo = "video/wmv"
    } else if(this.nomeDoFilmeAtual.slice(-3)=="flv"){
      this.tipodeVideo = "video/flv"
    } else {
      this.tipodeVideo = "video/webm"
    }

    this.url = this.baseUrl+this.requests.filter(req=>req.request==horario)[0].horario+"/"+encodeURI(this.nomeDoFilmeAtual)

    setTimeout(()=>{
      this.exibeVideo=true
      this.timeBarUpdate()
    },100)

    this.resetForm(horario)

    // this.getPontoDePartida(idDoFilme)
    
  }  

  // getPontoDePartida(idDoFilme){

  //   this.exibeVideo=false

  //   this.pontoDePartidaService.getPontoDePartida(idDoFilme).subscribe(
  //     data=>{
  //       console.log("data",data)
  //       let filme = data
  //       this.horario = filme.horario
  //       this.idDofilmeAtual = filme.idDoFilme
  //       this.nomeDoFilmeAtual = filme.filme
  //       this.commonServices.updatePageTitle(this.nomeDoFilmeAtual)
  //       this.duracaoVideoSelecionado = filme.duracao
  
  //       this.selectVideoForm.get(filme.horario+"FormControl").setValue(filme.idDoFilme)          
  
  //       this.url=this.baseUrl+filme.horario+"/"
  //                 +encodeURI(filme.filme)+"#t="+filme.horaInicio
            
  //       let infoDoFilmeAtual = {}
  //       infoDoFilmeAtual['cortesParaIntervalo'] = filme?.cortesParaIntervalo
  //       infoDoFilmeAtual['corteInicio'] = filme?.corteInicio
  //       infoDoFilmeAtual['corteFinal'] = filme?.corteFinal  
  //       this.exibeVideo=true
  //       this.updateAVElements()
  //       this.timeBarUpdate()

  //       this.setSquare(filme.horario)
  //       this.updatePontoDePartidaACadaSegundo(idDoFilme)
  
  //       setTimeout(()=>{
  //         this.volumeScroll()
  //       },3000)        
  //     }      
  //   )
  // }

  getList(): void {    
    let unsubscribe=
    this.firebaseService.getListFromfirestore("none","programa","filmeDaTia").snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe((data:any ) => {
      let tempData=[]
      data.map(registro=>{
        if(registro.ref!="Teste"){
          registro.ref.get()
          .then(res=>{
            let obj = res.data()
            obj.id = registro.id
            tempData.push(obj)
          })
        }            
      })
      this.videoFilmesDaTia=tempData.sort(this.commonServices.sortPorTitulo())
      console.log(this.videoFilmesDaTia)
      unsubscribe.unsubscribe()
    });
  }
  
  updatePontoDePartidaACadaSegundo(idDoFilme){

    this.updateAVElements()
    setInterval(()=>{
      if(this.videoElement){
        // this.pontoDePartidaService.updatePontoDePartida({
        //   "horaInicio":this.videoElement.currentTime
        // },idDoFilme).subscribe(x=>{})
        
      this.videoCurrentTime= this.commonServices?.toTime(this.videoElement.currentTime)
      }

    },1000)       
  }

  timeBarUpdate(){          
    
    setTimeout(()=>{
      this.updateAVElements()        
      this.videoElement.addEventListener('volumechange',event=>{
        this.audiovolumebar.setValue(event.target['volume']*100)  
      })
        
      this.videoElement.addEventListener('mousemove',event=>{
        this.mouseMoving=true
        setTimeout(()=>{
          this.mouseMoving=false
        },3000)
      })
      this.videoElement.addEventListener('timeupdate',(event)=>{
        this.videobar.setValue((this.videoElement.currentTime/this.duracaoVideoSelecionado)*100)
      })

    },500)
  }

  returnLeft(tempo){

    return "left: "+tempo+36+"px"
  }

  volumeScroll(){
    var current = 0;
    var doScroll = function (e) {
        // cross-browser wheel delta
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    
        // Do something with `delta`
        current = current + delta;
        if(this.videoElement){        
          if(delta== 1 && this.videoElement.volume <= 0.9){this.videoElement.volume+=0.1;}
          if(delta== -1 && this.videoElement.volume > 0.1){this.videoElement.volume-=0.1;}
        }
        e.preventDefault();
    };

    this.videoElement.addEventListener("mousewheel", doScroll, false);
    this.videoElement.addEventListener("DOMMouseScroll", doScroll, false);

  }

  updateAVElements(){    
    this.videoElement = document.getElementsByTagName('video')[0]
    this.audioElement = document.getElementsByTagName('audio')[0]
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

  getDuracaoVideo(videoId){
    let listaDeVideos = this.videoFilmesDaTia
    return listaDeVideos.filter(videoDaLista=>videoDaLista.id==videoId)[0].duracao
  }

  resetForm(formAlterado){    
    Object.keys(this.selectVideoForm.controls).map(control=>{
      if(formAlterado!=control.replace("FormControl","")){
        this.selectVideoForm.get(control).setValue("")
      }
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

}
