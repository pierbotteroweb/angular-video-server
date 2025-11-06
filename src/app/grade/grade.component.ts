import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { CommonService } from 'src/services/common.service';
import { Subject } from 'rxjs';
import { MongodbService } from '../services/mongodb.service';
import { FirebaseService } from '../services/firebase.service';
import { sts } from 'shuffle-tv-services/lib'

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.scss']
})
export class GradeComponent implements OnInit {
  programaDeTv: { id: string; 
                  titulo: string; 
                  duracao: string; 
                  canal?: string;  
                  value?: string; }[];

  programaDeTvFiltered: { id: string; 
                          titulo: string; 
                          duracao: string; 
                          canal?: string; 
                          value?: string; }[];

  selectedProgramaDeTv: any;
  selectedProgramaDeTvBlocos: any;
  selectedCanal: string = "Globo";
  selectedDiaDaSemana:string;
  selectedDiaDestinoDaSemana:string;


  listaSemana:any=[]  
  listaOrigemReduzida: Array<any>;
  listaParaUpdate: Array<any>;
  listaDeIntervalosAdicionados: Array<any>;
  idProgTotal: any;

  alerta:String;
  exibeSemanaDestino:boolean;
  emProcessoDeUpdate:boolean;

  intervalosCount:number;
  prePosCount:number;
  prePosApi:string;
  prePosAvailable:boolean;
  programasReplicadosCount:number;

  qtdeIntervalos:number;
  indexToAdd:number;
  lengthListaFinal:number;

  listaBlocos:Array<any>=[];
  listaProgramasBlocos:Array<any>=[];
  blocosAmount:number;
  programasBlocosCount:number;
  programasPorBloco:Object;

  spyListaAdicionada: Subject<any>;
  spyListaReplicada: Subject<any>;

  getInfoClicado:boolean;
  getInfoBlocoClicado:boolean;
  getInfoFromBlocoClicado:boolean;
  unsubscribeGetProgramasDeTv:any;

  constructor(private commonServices: CommonService,
              private firebaseService: FirebaseService,
              private mongodbService: MongodbService,
              private formBuilder: FormBuilder) { 
                this.selectVideoForm = this.formBuilder.group({
                  semanaFormControl:[""],
                  semanaDestinoFormControl:[""],
                  canaisFormControl:[""],
                  mimeTypeFormControl:[""],
                  programaDeTvFormControl:[""]
                })
               }

  programaClicado:any;
  programaBlocoSelectionado:any;
  selectVideoForm :any
  novoPrograma:FormControl
  duracaoEstimada:FormControl
  semana:Array<String>
  semanaSemBlocos:Array<String>
  horas:any = []
  canais: Array<any>

  ngOnInit(): void {

    this.semana = this.semanaSemBlocos = ["segunda","terca","quarta","quinta","sexta","sabado","domingo"]

    this.exibeSemanaDestino=false
    this.spyListaAdicionada = new Subject()
    this.spyListaAdicionada.subscribe((info)=>{
      if(this.intervalosCount){
        setTimeout(()=>{
          this.addIntervalo((info.intAmount+2),info.intervaloApi)
        },500)
      } else if(this.prePosCount){
        this.addPrePos(info.prePosApi)
      }
    })

    
    this.spyListaReplicada = new Subject()
    this.spyListaReplicada.subscribe((programa)=>{
      if(this.programasReplicadosCount>=0){
        this.selectVideoForm.get('programaDeTvFormControl').setValue(programa)
        this.adicionarPrograma()
      }
    })


    this.getListaDeProgramasDeTvFromMongodb()
    this.getCanaisFromMongoDB()
    
    this.selectVideoForm.get('semanaDestinoFormControl')
    .valueChanges.subscribe(value=>{
      this.alerta=""
      this.selectedDiaDestinoDaSemana=value
    })

    this.selectVideoForm.get('semanaFormControl')
    .valueChanges.subscribe(value=>{
      this.alerta=""
      this.selectedDiaDaSemana=value
    })

    this.selectVideoForm.get('canaisFormControl')
    .valueChanges.subscribe(value=>{
      this.alerta=""
      this.selectedCanal=this.canais.filter(canal=>canal._id==value)[0].emissora
      this.filterProgramaDeTV(this.selectedCanal)
      this.getLista()
    })

    this.selectVideoForm.get('programaDeTvFormControl')
    .valueChanges.subscribe(value=>{
      this.alerta=""
      this.selectedProgramaDeTv=this.programaDeTv.filter(prog=>prog.value==value)[0]
    })

    for(let hora=6;hora<24;hora++){
      this.horas.push(`${hora}:00`)
    }

    for(let hora=0;hora<6;hora++){
      this.horas.push(`${hora}:00`)
    }    
  }

  getCanaisFromMongoDB(){
    let unsubscribe=
    this.mongodbService.getCanais().subscribe((data:any )=>{ 
      this.canais=data.sort(sts.sortPor("canal"))
      this.displaySelectedCanalInfo()
      this.canais.map(canal=>{
        this.gerarListasDeBlocos(canal.emissora)
      })
      unsubscribe.unsubscribe()
    })
  }
  
  removePrograma(){
    if(this.selectedDiaDaSemana&&this.programaClicado){
      let indexToRemove = this.programaClicado.indice+1
      let itemRemoved = this.listaSemana[this.selectedDiaDaSemana][this.programaClicado.indice]
      this.alerta="Item Removido"
      setTimeout(()=>{this.alerta=""},1000)
      itemRemoved.added=false
      this.updateOnMongoDB(itemRemoved,"itemRemoved")

      if(this.listaSemana[this.selectedDiaDaSemana].length>1){
        let newList = [...this.listaSemana[this.selectedDiaDaSemana].slice(0,indexToRemove-1),
                       ...this.listaSemana[this.selectedDiaDaSemana].slice(indexToRemove)] 
        this.recalculaHorariosDeExibicao(newList)
      }else{
        this.listaSemana[this.selectedDiaDaSemana]=[]
      }

    } else if(this.programaBlocoSelectionado){

      this.programaBlocoSelectionado.blocos.map(prog=>{
        prog.added=false
        this.updateOnMongoDB(prog,"prog")        
      })
      
      let newList = this.listaSemana[this.selectedDiaDaSemana]
                    .filter(prog=>prog.idProgTotal!==this.programaBlocoSelectionado.blocos[0].idProgTotal)

      this.recalculaHorariosDeExibicao(newList)

      let newListBloco = this.listaSemana[this.selectedDiaDaSemana+'Bloco']
                    .filter(prog=>prog.idProgTotal!==this.programaBlocoSelectionado.blocos[0].idProgTotal)
      
      this.listaSemana[this.selectedDiaDaSemana+'Bloco'] = newListBloco


    } else if(!this.programaClicado){
      this.alerta="Selecione programa a ser deletado"
    } else if(!this.selectedDiaDaSemana){
      this.alerta="Informe o dia da semana"
    } else if(!this.programaClicado){
      this.alerta="Selecione programa a ser deletado"
    }
  }

  organizaIntervalos(){
    let listaParaORganizar = this.emProcessoDeUpdate? this.listaParaUpdate : this.listaSemana[this.selectedDiaDaSemana]
    let lengthListaParaOrganizar = listaParaORganizar.length
    
    let indexInicioAdicionados=listaParaORganizar.find(prog=>prog.idProgTotal==this.idProgTotal).indice

    let indexFinalAdicionados=listaParaORganizar.reverse().find(prog=>prog.idProgTotal==this.idProgTotal).indice

    listaParaORganizar.reverse()

    let listaPreAdicionados = listaParaORganizar.slice(0,indexInicioAdicionados)
    
    
    let listaAdicionados = listaParaORganizar.slice(indexInicioAdicionados,indexFinalAdicionados+2)
    
    let listaAadicionadosPrograma = listaAdicionados.filter(prog=>prog.tipo!=="intervalos")
    
    let listaAadicionadosIntervalos = listaAdicionados.filter(prog=>prog.tipo=="intervalos")
    
    let listaPosAdicionados = listaParaORganizar.slice(indexFinalAdicionados+2,lengthListaParaOrganizar)
    
    let listaOrdenada = []
    listaAadicionadosPrograma.map((prog,index)=>{
      if(index<listaAadicionadosIntervalos.length){
          listaOrdenada.push(listaAadicionadosPrograma[index])
          listaOrdenada.push(listaAadicionadosIntervalos[index])
      }else {
        listaOrdenada.push(listaAadicionadosPrograma[index])
      }
      let listaFinal = [...listaPreAdicionados,...listaOrdenada,...listaPosAdicionados] 
      this.qtdeIntervalos=0
      this.intervalosCount=0

      this.recalculaHorariosDeExibicao(listaFinal) 
    })
  }

  organizaPrePos(){
    let listaParaORganizar = this.emProcessoDeUpdate? this.listaParaUpdate : this.listaSemana[this.selectedDiaDaSemana]
    let lengthListaParaOrganizar = listaParaORganizar.length
    
    let indexInicioAdicionados=listaParaORganizar.indexOf(listaParaORganizar.find(prog=>prog.idProgTotal==this.idProgTotal))

    // listaParaORganizar.reverse()

        
    let listaAdicionados = listaParaORganizar.filter(prog=>prog.idProgTotal==this.idProgTotal)

    let indexFinalAdicionados=indexInicioAdicionados+listaAdicionados.length-2
    let listaPreAdicionados = listaParaORganizar.slice(0,indexInicioAdicionados)
    
    let listaAadicionadosPrograma = listaAdicionados.filter(prog=>!prog.atracao.includes("prePos"))
    let listaAadicionadosPrepos = listaAdicionados.filter(prog=>prog.atracao.includes("prePos"))
    let listaPosAdicionados = listaParaORganizar.slice(indexFinalAdicionados+1,lengthListaParaOrganizar).filter(prog=>prog.idProgTotal!=this.idProgTotal)

    let listaFinal = [...listaPreAdicionados,
                     listaAadicionadosPrepos[0],
                      ...listaAadicionadosPrograma,
                      listaAadicionadosPrepos[1],
                      ...listaPosAdicionados]
                      
    this.prePosCount=0
    this.prePosAvailable=false
    this.programaClicado=""

      this.recalculaHorariosDeExibicao(listaFinal) 
  }

  organizaProgramasBlocos(){

    let listaParaORganizar = this.emProcessoDeUpdate? this.listaParaUpdate : this.listaSemana[this.selectedDiaDaSemana]

    let indexAdicionadosInicio = listaParaORganizar.indexOf(listaParaORganizar.find(prog=>prog.idProgTotal==this.idProgTotal))

    let listaPreAdicionados = listaParaORganizar.slice(0,indexAdicionadosInicio)

    let listaAdicionados=listaParaORganizar.filter(prog=>prog.idProgTotal==this.idProgTotal)

    let listaPosAdicionados = listaParaORganizar.slice(indexAdicionadosInicio+listaAdicionados.length,listaParaORganizar.length)

    let indexIntervaloBloco1=listaAdicionados.indexOf(listaAdicionados.find(prog=>prog.atracao==this.selectedProgramaDeTvBlocos.anexos.intervalo))

    let indexIntervaloBloco2=indexIntervaloBloco1+2
    let indexIntervaloBloco3=indexIntervaloBloco2+2
    let indexIntervaloBloco4=indexIntervaloBloco3+2
    let indexIntervaloBloco5=indexIntervaloBloco4+2
    let indexIntervaloBloco6=indexIntervaloBloco5+2

    let listaBlocoPreAdicionados = listaAdicionados.slice(0,indexIntervaloBloco1)
    
    let listaBlocoIntermediariosAdicionados1 = []
    if(this.selectedProgramaDeTvBlocos.anexos.bloco2){
      listaBlocoIntermediariosAdicionados1 = listaAdicionados.slice(indexIntervaloBloco1,indexIntervaloBloco2)
    }
    let listaBlocoIntermediariosAdicionados2 = []
    if(this.selectedProgramaDeTvBlocos.anexos.bloco3){
      listaBlocoIntermediariosAdicionados2 = listaAdicionados.slice(indexIntervaloBloco2,indexIntervaloBloco3)
    }
    let listaBlocoIntermediariosAdicionados3 = []
    if(this.selectedProgramaDeTvBlocos.anexos.bloco4){
      listaBlocoIntermediariosAdicionados3 = listaAdicionados.slice(indexIntervaloBloco3,indexIntervaloBloco4)
    }
    let listaBlocoIntermediariosAdicionados4 = []
    if(this.selectedProgramaDeTvBlocos.anexos.bloco5){
      listaBlocoIntermediariosAdicionados4 = listaAdicionados.slice(indexIntervaloBloco4,indexIntervaloBloco5)
    }
    let listaBlocoIntermediariosAdicionados5 = []
    if(this.selectedProgramaDeTvBlocos.anexos.bloco6){
      listaBlocoIntermediariosAdicionados5 = listaAdicionados.slice(indexIntervaloBloco5,indexIntervaloBloco6)
    }

    let indexInicioBlocoPosAdicionado = indexIntervaloBloco1
    if(this.selectedProgramaDeTvBlocos.anexos.bloco2) indexInicioBlocoPosAdicionado = indexIntervaloBloco2
    if(this.selectedProgramaDeTvBlocos.anexos.bloco3) indexInicioBlocoPosAdicionado = indexIntervaloBloco3
    if(this.selectedProgramaDeTvBlocos.anexos.bloco4) indexInicioBlocoPosAdicionado = indexIntervaloBloco4
    if(this.selectedProgramaDeTvBlocos.anexos.bloco5) indexInicioBlocoPosAdicionado = indexIntervaloBloco5
    if(this.selectedProgramaDeTvBlocos.anexos.bloco6) indexInicioBlocoPosAdicionado = indexIntervaloBloco6
     


    let listaBlocoPosAdicionados = listaAdicionados.slice(indexInicioBlocoPosAdicionado,listaAdicionados.length)

    setTimeout(()=>{
      let listaBloco1 = this.listaProgramasBlocos.filter(bloco=>this.selectedProgramaDeTvBlocos.anexos.bloco1.includes(bloco.atracao))
      
      let listaBloco2 = []
      if(this.selectedProgramaDeTvBlocos.anexos.bloco2){
        listaBloco2 = this.listaProgramasBlocos.filter(bloco=>this.selectedProgramaDeTvBlocos.anexos.bloco2.includes(bloco.atracao))
      }
      
      let listaBloco3 = []
      if(this.selectedProgramaDeTvBlocos.anexos.bloco3){
        listaBloco3 = this.listaProgramasBlocos.filter(bloco=>this.selectedProgramaDeTvBlocos.anexos.bloco3.includes(bloco.atracao))
      }
      
      let listaBloco4 = []
      if(this.selectedProgramaDeTvBlocos.anexos.bloco4){
        listaBloco4 = this.listaProgramasBlocos.filter(bloco=>this.selectedProgramaDeTvBlocos.anexos.bloco4.includes(bloco.atracao))
      }
      
      let listaBloco5 = []
      if(this.selectedProgramaDeTvBlocos.anexos.bloco5){
        listaBloco5 = this.listaProgramasBlocos.filter(bloco=>this.selectedProgramaDeTvBlocos.anexos.bloco5.includes(bloco.atracao))
      }
      
      let listaBloco6 = []
      if(this.selectedProgramaDeTvBlocos.anexos.bloco6){
        listaBloco6 = this.listaProgramasBlocos.filter(bloco=>this.selectedProgramaDeTvBlocos.anexos.bloco6.includes(bloco.atracao))
      }

      let listaFinalAdicionados = [...listaBlocoPreAdicionados,
                                   ...listaBloco1,...listaBlocoIntermediariosAdicionados1,
                                   ...listaBloco2,...listaBlocoIntermediariosAdicionados2,
                                   ...listaBloco3,...listaBlocoIntermediariosAdicionados3,
                                   ...listaBloco4,...listaBlocoIntermediariosAdicionados4,
                                   ...listaBloco5,...listaBlocoIntermediariosAdicionados5,
                                   ...listaBlocoPosAdicionados]
      let listaFinal=[...listaPreAdicionados,...listaFinalAdicionados,...listaPosAdicionados]
      this.recalculaHorariosDeExibicao(listaFinal) 
    },1000)
  }

  recalculaHorariosDeExibicao(newList){
    let diaDaSemana = this.selectedDiaDestinoDaSemana?
    this.selectedDiaDestinoDaSemana:this.selectedDiaDaSemana

    newList[0]['horarioDeExibicao']="06:30:00"
    
    if(newList.length>=1){
      newList.map((prog,index)=>{
        if(index>0){
          let progAnterior = newList[index-1]
          prog.indice = index
          prog.horarioDeExibicao= 
            sts.toTime(progAnterior.duracaoTotalDaAtracaoEmSegundos
            +sts.toSeconds(progAnterior.horarioDeExibicao))
        }
      })
    } 

    if(this.emProcessoDeUpdate){
      this.listaParaUpdate= newList
    } else {
      this.listaSemana[diaDaSemana]=newList
    }

    if(this.selectedProgramaDeTv){
    
      let intervaloApi
  
      if(this.selectedProgramaDeTv.tipo=="intervalos"&&this.selectedProgramaDeTv.prePos==false){
        intervaloApi = this.selectedProgramaDeTv.value
      } else if(this.selectedProgramaDeTv.anexos&&this.selectedProgramaDeTv.anexos.intervalo){
        intervaloApi = this.selectedProgramaDeTv.anexos.intervalo
      }
  
      if(this.intervalosCount){
        let intInfo = {}
        intInfo['intAmount'] = this.intervalosCount
        intInfo['intervaloApi'] = intervaloApi
  
        this.spyListaAdicionada.next(intInfo)
      } else if(this.qtdeIntervalos){
        this.lengthListaFinal = newList.length
        if(!this.prePosAvailable){
          this.selectVideoForm.get('programaDeTvFormControl')
          .setValue(sts.lowerCaseFirstChar(this.selectedProgramaDeTv.value.replace("int","")))
        }
        this.organizaIntervalos()
      } else if(newList.length==this.lengthListaFinal&&this.prePosAvailable){
        if(this.prePosCount>0){
          let prePosInfo = {}
          prePosInfo['intAmount'] = this.prePosCount
          prePosInfo['prePosApi'] = this.prePosApi
          this.spyListaAdicionada.next(prePosInfo)
        } else {
          this.selectVideoForm.get('programaDeTvFormControl')
          .setValue(sts.lowerCaseFirstChar(this.selectedProgramaDeTv.value.replace("prePos","")))
          this.organizaPrePos()
        }
      } else if(this.selectedProgramaDeTv.tipo!="intervalos"){
        if(this.programasBlocosCount){
          this.addBlocosFromMongoDB()
        }
      }

    }

  }

  updateOnMongoDB(video,type):void {

    if(video.programaDeTv=="intCorujaoDois"){
      // console.log("updateOnMongoDB ",video)
      // console.log("updateOnMongoDB ",video.titulo)
      // console.log("updateOnMongoDB ",video.added)
      // console.log("updateOnMongoDB ",video.order)
    }
    // console.log("Running updateOnMongoDB ",video)
    this.mongodbService.updateVideo(video._id,video).subscribe(() => {
      // console.log('Video updated successfully!');
    });
    
  }

  updateCanaisOnMongoDB(canal):void {
    this.mongodbService.updateCanais(canal).subscribe(() => {
      console.log('Canal updated successfully!');
    });
    
  }

  addIntervalo(intAmount,intApi){
    let listaAtual = this.emProcessoDeUpdate ? this.listaParaUpdate:
                     this.listaSemana[this.selectedDiaDaSemana]
    let info = listaAtual[this.indexToAdd]
    this.clickAtracao(info,this.selectedDiaDaSemana,this.indexToAdd)
    this.selectVideoForm.get('programaDeTvFormControl').setValue(intApi)
    this.adicionarPrograma()
    this.intervalosCount--
  }

  addPrePos(prePosApi){
    this.lengthListaFinal++

    let listaAtual = this.emProcessoDeUpdate ? this.listaParaUpdate:
                     this.listaSemana[this.selectedDiaDaSemana]
    let indexToSelect = listaAtual.indexOf(listaAtual.find(prog=>prog.idProgTotal==this.idProgTotal))
    let info = listaAtual[indexToSelect]
    this.clickAtracao(info,this.selectedDiaDaSemana,indexToSelect)
    this.selectVideoForm.get('programaDeTvFormControl').setValue(prePosApi)
    this.adicionarPrograma()
    this.prePosCount--
  }

  adicionarPrograma(): void {
    // CHECK IF DIA DA SEMANA AND PROGRAMA DE TV ARE SELECTED
    if(!this.selectedDiaDaSemana || !this.selectedProgramaDeTv){
      this.alerta="Informe o dia da semana e programa a ser adicionado"
      return
    }
    // GET UNSUBSCRIBABLE LIST OF PROGRAMS ACCORDING TO SELECTED PROGRAMA DE TV

    if(this.selectedProgramaDeTv.anexos?.blocosAmount&&this.listaBlocos.length==0){
      this.programasPorBloco={}
      this.blocosAmount=this.selectedProgramaDeTv.anexos.blocosAmount
      this.selectedProgramaDeTvBlocos=this.selectedProgramaDeTv
      for(let i=0;i<this.blocosAmount;i++){
        this.selectedProgramaDeTv.anexos["bloco"+(i+1)].map((prog,index)=>{
          this.listaBlocos.push(prog)
          this.programasPorBloco["bloco"+(i+1)]=index+1
        })
      }
      this.programasBlocosCount=this.listaBlocos.length
    }

    if(this.selectedProgramaDeTv.tipo!=="intervalos"
     &&!this.listaBlocos.includes(this.selectedProgramaDeTv.value)){
      this.idProgTotal =  this.selectedProgramaDeTv.value+new Date().valueOf()
    }

    
    this.unsubscribeGetProgramasDeTv =
    this.mongodbService.getProgramasDeTv(this.selectedProgramaDeTv.tipo,this.selectedProgramaDeTv.value)
    .subscribe((data:any ) => {

      //GET EACH REF ON THE LISTA DE PROGRAMAS AND CREATE A NEW LIST WITH THE PROGRAMAS DATA
      this.montaLista(data)
    });

     if(!this.programaClicado){
      this.alerta="Selecione programa a ser deletado"
    }
  }
  
  montaLista = (data)=>{
    let videoAdicionado

    let listaDeProgramas = data

    //FILTER 
    let listaFiltrada = listaDeProgramas.filter(video=>video.order&&!video.added)
      .sort(sts.sortPor("order"))
      
      
      
      if(listaFiltrada.length>0){

                let prog:any = this.selectedProgramaDeTv
                
                if(!this.prePosAvailable&&prog.anexos&&prog.anexos.prePos){
                  this.prePosApi=prog.anexos.prePos
                  this.prePosAvailable=true
                  this.prePosCount=2
                }

                videoAdicionado = listaFiltrada[0]

                // if(videoAdicionado.tipo!="intervalos"&&!videoAdicionado.titulo.includes("Int")){
                //   this.previousAddedOrderIndex=99999       
                // } 

                  let newProg:Object ={}
                  let newProgList: Array<any> =[]

                  if(videoAdicionado.cortesParaIntervalo.length){
                    let cortes = videoAdicionado.cortesParaIntervalo
                    this.intervalosCount = this.qtdeIntervalos = cortes.length
                    let progModel = {
                      "atracao":this.selectedProgramaDeTv.value,
                      "tituloAtracao":videoAdicionado.tituloAtracao,
                      "titulo":videoAdicionado.titulo,
                      "volume":videoAdicionado.volume?videoAdicionado.volume:1,
                      "horarioDeExibicao":"",
                      "id":videoAdicionado._id,
                      "idProgTotal":this.idProgTotal,
                      "tipo":videoAdicionado.tipo
                    }

                    let inicio = 0
                    if(videoAdicionado.corteInicio){
                      inicio=videoAdicionado.corteInicio
                    }

                    let final = cortes[0]

                    progModel['inicio']=inicio
                    progModel['final']=final
                    progModel['duracaoTotalDaAtracaoEmSegundos']=final-inicio
                    newProgList.push(progModel)

                    cortes.map((corte,index)=>{
                      let prog =  {
                        "atracao":this.selectedProgramaDeTv.value,
                        "tituloAtracao":videoAdicionado.tituloAtracao,
                        "titulo":videoAdicionado.titulo,
                        "volume":videoAdicionado.volume?videoAdicionado.volume:1,
                        "horarioDeExibicao":"",
                        "id":videoAdicionado._id,
                        "idProgTotal":this.idProgTotal,
                        "tipo":videoAdicionado.tipo
                      }
                      
                      if(index<cortes.length-1) {
                        prog['inicio']=cortes[index]
                        prog['final']=cortes[index+1]
                        prog['duracaoTotalDaAtracaoEmSegundos']=cortes[index+1]-cortes[index]
                        newProgList.push(prog)
                      } else {
                        let finalDoCorte = videoAdicionado.corteFinal?videoAdicionado.corteFinal:videoAdicionado.duracao
                        prog['inicio']=cortes[index]
                        prog['final']=finalDoCorte
                        prog['duracaoTotalDaAtracaoEmSegundos']=finalDoCorte-cortes[index]
                        newProgList.push(prog)
                      }
                    })
                  } else {
                    newProg = {
                      "atracao":this.selectedProgramaDeTv.value,
                      "tituloAtracao":videoAdicionado.tituloAtracao,
                      "titulo":videoAdicionado.titulo,
                      "volume":videoAdicionado.volume?videoAdicionado.volume:1,
                      "horarioDeExibicao":"",
                      "duracaoTotalDaAtracaoEmSegundos": videoAdicionado.duracao,
                      "id":videoAdicionado._id,
                      "idProgTotal":this.idProgTotal,
                      "tipo":videoAdicionado.tipo
                    }

                    if(videoAdicionado.corteFinal){
                      let corteFinal = videoAdicionado.corteFinal
                      newProg['corteFinal']=corteFinal
                      newProg['duracaoTotalDaAtracaoEmSegundos']=corteFinal
                    }

                    if(videoAdicionado.corteInicio){
                      let corteInicio = videoAdicionado.corteInicio
                      let duracao = videoAdicionado.corteInicio
                      newProg['corteInicio']=duracao-corteInicio
                    }
                  }

                  let listInProcess = this.emProcessoDeUpdate ? this.listaParaUpdate : this.listaSemana[this.selectedDiaDaSemana]
                  videoAdicionado.added=true
                  this.updateOnMongoDB(videoAdicionado,"videoAdicionado")        

                  this.indexToAdd = this.programaClicado ? this.programaClicado.indice+1 : listInProcess.length
                  let newList
                  if(newProgList.length>0){
                    newList = [...listInProcess.slice(0,this.indexToAdd),
                               ...newProgList,...listInProcess.slice(this.indexToAdd)]
                  } else {
                    newList = [...listInProcess.slice(0,this.indexToAdd),
                               newProg,...listInProcess.slice(this.indexToAdd)]
                  }
                  if(!this.intervalosCount&&!this.prePosCount){
                    this.clearInfoAtracao()
                  }
                  this.unsubscribeGetProgramasDeTv.unsubscribe()
                  this.recalculaHorariosDeExibicao(newList)
      } else {
        this.resetAddedLista(listaDeProgramas, "programa")
        this.unsubscribeGetProgramasDeTv.unsubscribe()
      }
  }

  adicionarProgramaBloco(bloco): void {
    
    let unsubscribe=
    this.mongodbService.getProgramasDeTv("dublado",bloco)
    .subscribe((data:any ) => {
      let videoAdicionado

      let listaDeProgramas = data

      //GET EACH REF ON THE LISTA DE PROGRAMAS AND CREATE A NEW LIST WITH THE PROGRAMAS DATA

      const montaLista = ()=>{

        //FILTER 
        let listaFiltrada = listaDeProgramas.filter(video=>video.order&&!video.added)
          .sort(sts.sortPor("order"))
                    if(listaFiltrada.length>0){
                      videoAdicionado = listaFiltrada[0]
                    } else{
                      videoAdicionado = listaDeProgramas[0]
                      if(listaDeProgramas.length>1){
                        this.resetAddedLista(listaDeProgramas.splice(1,listaDeProgramas.length),"blocos")                      
                      }
                    }console.log("videoAdicionado ",videoAdicionado)

                    if(videoAdicionado.tipo=="intervalos") console.log("videoAdicionado ",videoAdicionado)

                      let newProg:Object ={}

                        newProg = {
                          "atracao":bloco,
                          "tituloAtracao":videoAdicionado.tituloAtracao,
                          "titulo":videoAdicionado.titulo,
                          "volume":videoAdicionado.volume?videoAdicionado.volume:1,
                          "horarioDeExibicao":"",
                          "duracaoTotalDaAtracaoEmSegundos": videoAdicionado.duracao,
                          "id":videoAdicionado._id,
                          "idProgTotal":this.idProgTotal,
                          "tipo":videoAdicionado.tipo
                        }

                        if(videoAdicionado.corteFinal){
                          let corteFinal = videoAdicionado.corteFinal
                          newProg['corteFinal']=corteFinal
                          newProg['duracaoTotalDaAtracaoEmSegundos']=corteFinal
                        }
  
                        if(videoAdicionado.corteInicio){
                          let corteInicio = videoAdicionado.corteInicio
                          let duracao = videoAdicionado.corteInicio
                          newProg['corteInicio']=duracao-corteInicio
                        }
                      videoAdicionado.added=true
                      this.updateOnMongoDB(videoAdicionado,"videoAdicionado")
                      unsubscribe.unsubscribe()
                      this.listaProgramasBlocos.push(newProg)
            unsubscribe.unsubscribe()
      }
      montaLista()
    });
  }

  replicaNext(){
    this.programaClicado=""

    if(this.programasReplicadosCount==0&&this.emProcessoDeUpdate){
      
      this.listaSemana[this.selectedDiaDaSemana] = this.listaParaUpdate
      this.listaParaUpdate=[]
      this.emProcessoDeUpdate=false
    } else {

      this.programasReplicadosCount--
      let programaParaReplicar = this.listaSemana[this.selectedDiaDaSemana]
                            .find(prog=>prog.idProgTotal==
                            this.listaOrigemReduzida[this.programasReplicadosCount]&&
                            prog.tipo!=="intervalos").atracao
  
      this.spyListaReplicada.next(programaParaReplicar)
    }
  }

  resetAddedLista(lista,type){
    const functionThatReturnsAPromise = video => { //a function that returns a promise
      
      video.added=false
      this.updateOnMongoDB(video,"video")
      return Promise.resolve('ok')
    }
    
    const setItemsAddedFalseAsync = async video => {
      return functionThatReturnsAPromise(video)
    }
    
    const setAllAddedFalse = async () => {
      return Promise.all(lista.map(video => setItemsAddedFalseAsync(video)))
    }
    
    setAllAddedFalse().then(data => {
      if(type=="programa"){
        this.adicionarPrograma()
      }
    }) 
  }

  addBlocosFromMongoDB(){this.listaProgramasBlocos=[]
    const callAdicionarProgramaBloco = bloco => { 
      this.adicionarProgramaBloco(bloco)
      return Promise.resolve('ok')
    }
    
    const asyncFunctionThatCallsFunction = async bloco => {
      return callAdicionarProgramaBloco(bloco)
    }
    
    const getAllBlocos = async () => {
      return Promise.all(this.listaBlocos.map(bloco => asyncFunctionThatCallsFunction(bloco)))
    }
    
    getAllBlocos().then(data => {
        // this.adicionarPrograma()
        this.programasBlocosCount=0
        this.listaBlocos=[]
        this.organizaProgramasBlocos()
    }) 
  }

  subirLista(){
    localStorage.setItem('data',JSON.stringify(this.listaSemana))
    let canal =  this.canais.filter(canal=>canal.emissora==this.selectedCanal)[0]
    this.updateCanaisOnMongoDB(canal)
    this.semana.map((dia:any)=>{
      if(this.listaSemana[dia]){
      }
    })
  }

  getLista(){
      this.listaSemana = this.canais.filter(canal=>canal.emissora==this.selectedCanal)[0]
      if(this.selectedDiaDaSemana&&!this.listaSemana[this.selectedDiaDaSemana]) this.addDiasDeSemanaNoCanal()
      this.getListaDeProgramasDeTvFromMongodb()
  }

  addDiasDeSemanaNoCanal(){
    this.semana.map((dia:any)=>{
      this.listaSemana[dia]=[]
    })
  }

  getListaDeProgramasDeTvFromMongodb(){
    let unsubscribe = 
    this.mongodbService.getListaDeProgramasDeTv().subscribe((data:any)=>{
      if(this.selectedCanal){            
       data = [...data.filter(prog=>{ return prog.canal==this.selectedCanal})]
      }
      this.programaDeTvFiltered=this.programaDeTv=data.sort(sts.sortPorTitulo())
      unsubscribe.unsubscribe()

    })
  }

  filterProgramaDeTV(canal){
      this.programaDeTvFiltered=this.programaDeTv.filter(prog=> prog.canal== canal)
  }

  getStyle(width,dia,index?){
    if(this.programaClicado&&(this.programaClicado.indice==index)&&(this.programaClicado.dia==dia)){
      return `width:${width/10}px;background:blue`
    } else {      
      return `width:${width/10}px`
    }
  }

  getStyleBloco(width,dia,index?){
    if(this.programaBlocoSelectionado&&
      (this.programaBlocoSelectionado.indice==index)&&
      (this.programaBlocoSelectionado.dia==dia)){
      return `width:${width/10}px;background:blue`
    } else {      
      return `width:${width/10}px`
    }
  }

  getInfoBlocoAtracao(info,dia,index){
    this.getInfoClicado=false
    this.getInfoBlocoClicado=true
    this.getInfoFromBlocoClicado=false
    this.alerta=""
    this.programaClicado=""
    if(this.programaBlocoSelectionado==info){
      this.programaBlocoSelectionado=""
    }else{
      info.indice=index
      info.dia=dia
      this.programaBlocoSelectionado = info
      this.selectedDiaDaSemana = dia
    }
  }

  clickAtracao(info,dia,index){
    this.getInfoClicado=true
    this.getInfoBlocoClicado=false
    this.getInfoFromBlocoClicado=false
    this.alerta=""
    this.programaBlocoSelectionado=""
    if(this.programaClicado==info){
      this.programaClicado=""
    }else{
      info.indice=index
      info.dia=dia
      this.programaClicado = info
      this.selectVideoForm.get('semanaFormControl').setValue(dia)
      this.selectedDiaDaSemana = dia
    }
  }

  clickAtracaoFromBloco (info,dia,index){

    this.getInfoFromBlocoClicado=true
    this.programaClicado = info

  }

  clearInfoAtracao(){
      this.programaClicado=""
  }

  toggleSemanaDestino(){
    this.exibeSemanaDestino=!this.exibeSemanaDestino
    this.selectedDiaDestinoDaSemana=""
    this.emProcessoDeUpdate=false
    this.selectVideoForm.get('semanaDestinoFormControl').setValue("")
  }

  replicaListaDaSemana(){
    this.programaClicado=""
    if(this.selectedDiaDestinoDaSemana){
      this.listaSemana[this.selectedDiaDestinoDaSemana]=[]
      let listaOrigem = this.listaSemana[this.selectedDiaDaSemana] 
      this.listaOrigemReduzida = [...new Set(listaOrigem.map(prog=>prog.idProgTotal))]
      this.listaOrigemReduzida.reverse()
      this.selectVideoForm.get('semanaFormControl').setValue(this.selectedDiaDestinoDaSemana)
      this.programasReplicadosCount = this.listaOrigemReduzida.length-1
      let programToSelect = listaOrigem
                            .find(prog=>prog.idProgTotal==
                            this.listaOrigemReduzida[this.programasReplicadosCount]&&
                            prog.tipo!=="intervalos").atracao
      this.selectVideoForm.get('programaDeTvFormControl').setValue(programToSelect)
      this.adicionarPrograma()
    }
  }
 
  updateListaDaSemana(){
    this.emProcessoDeUpdate=true
    this.programaClicado=""
    this.listaParaUpdate=[]
    let listaOrigem = this.listaSemana[this.selectedDiaDaSemana] 
    this.listaOrigemReduzida = [...new Set(listaOrigem.map(prog=>prog.idProgTotal))]
    this.listaOrigemReduzida.reverse()
    this.programasReplicadosCount = this.listaOrigemReduzida.length-1
    let programToSelect = listaOrigem
                          .find(prog=>prog.idProgTotal==
                          this.listaOrigemReduzida[this.programasReplicadosCount]&&
                          prog.tipo!=="intervalos").atracao
    this.selectVideoForm.get('programaDeTvFormControl').setValue(programToSelect)
    this.adicionarPrograma()
  }

  gerarListasDeBlocos(emissora){
      let canal = this.canais.filter(canal=>canal.emissora==emissora)[0]
      let indCanal = this.canais.indexOf(canal)


      this.semana.map((dia:any)=>{
        let listaOriginal = canal[dia]
        if(listaOriginal){
        let listaDiaReduzida = [...new Set(listaOriginal.map(prog=>prog.idProgTotal))]

        let listaBlocos = listaDiaReduzida.map((progId:any)=>{
          let obj:any = {}
          let progInfo = listaOriginal.find(prog=>prog.idProgTotal==progId&&prog.tipo!=="intervalos")
          if(progInfo&&progInfo.atracao){
            obj.atracao = progInfo.atracao
            obj.idProgTotal = progInfo.idProgTotal
          }
          let blocos = listaOriginal.filter(prog2=>prog2.idProgTotal==progId)
          
          obj.horarioDeExibicao = blocos[0].horarioDeExibicao
          obj.blocos = blocos
          if(blocos.filter(lista=>lista.tipo!="intervalos").length>0){
            obj.arquivo = progInfo.titulo
            obj.tituloAtracao = progInfo.tituloAtracao
          }
          obj.tempoTotalEmSegundos = blocos.map(lista=>lista.duracaoTotalDaAtracaoEmSegundos).reduce((a,b)=>{return a+b})
          obj.tempoTotal = sts.toTime(obj.tempoTotalEmSegundos)
          return obj
        })
        this.canais[indCanal][dia+"Bloco"]=listaBlocos}
      })

        this.listaSemana=this.canais[indCanal]
        let semanaBloco = this.semana.map(dia=>dia+"Bloco")
        this.semana = [...this.semana,...semanaBloco]
  }

  displaySelectedCanalInfo(){
    this.firebaseService.getSeletorDeCanal()
    .snapshotChanges()
    .subscribe(change=>{

        let canal =  change[0].payload._delegate.doc._document.data.value.mapValue.fields.canal.integerValue   
        const newDate = new Date();

        this.findSelectedCanalId(canal)

        this.findDiaDaSemanaValue(newDate)

        this.scrollTocurrentBloco(canal,newDate)

    },err=>{
      console.log("ERR",err)
    })
  }

  findSelectedCanalId(canal){   
    canal = canal.toString()
    canal = canal=="6"?"32":canal
    canal = canal=="1"?"11":canal
    canal = canal=="3"?"13":canal
    let selectedCanalId = this.canais.filter(canalMapeado=>canalMapeado.canal==canal)[0]._id
    this.setCanaisForm(selectedCanalId)
  }

  setCanaisForm(selectedCanalId){
    this.selectVideoForm.get('canaisFormControl').setValue(selectedCanalId)
  }

  findDiaDaSemanaValue(newDate){
    let day = newDate.getDay()
    let hour = newDate.getHours();
    let diaDaSemanaValue
    let indexSemana
    if(day==0){
      indexSemana = 6
    } else {
      indexSemana = day-1
    }
    let now = newDate.toLocaleTimeString()
    let sixThiryAm = sts.toSeconds("06:00:00")
    let currentHour = newDate.getHours()
    if(sts.toSeconds(now)<=sixThiryAm){
      if(indexSemana==0){
        indexSemana=6
      } else{
        indexSemana--
      }
      currentHour = currentHour+18
    }
    diaDaSemanaValue = this.semana[indexSemana]
    this.setSemanaForm(diaDaSemanaValue)
  }

  setSemanaForm(diaDaSemanaValue){        
    this.selectVideoForm.get('semanaFormControl').setValue(diaDaSemanaValue)
  }

  scrollTocurrentBloco(canal,newDate){

    let diaDaSemanaValue = this.selectVideoForm.get('semanaFormControl').value
    let listaSemanaBloco = this.canais.filter(canalMapeado=>canalMapeado.canal==canal)[0][diaDaSemanaValue+"Bloco"]
    var time = newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds();

    let currentBloco
    let now = newDate.toLocaleTimeString()
    let sixThiryAm = sts.toSeconds("06:00:00")

    if(sts.toSeconds(now)<=sixThiryAm){
      currentBloco = listaSemanaBloco.find(bloco=>{ 
        let tempoTotalEmSegundosDoBloco = sts.toSeconds(bloco.horarioDeExibicao)+bloco.tempoTotalEmSegundos
        return tempoTotalEmSegundosDoBloco < sixThiryAm && tempoTotalEmSegundosDoBloco > sts.toSeconds(time)
     })
    } else {
      currentBloco = listaSemanaBloco.find(bloco=>{ 
        return (sts.toSeconds(bloco.horarioDeExibicao)+bloco.tempoTotalEmSegundos)>
       sts.toSeconds(time)
     })
    }
    
    let IndexCurrentBloco = listaSemanaBloco.indexOf(currentBloco)

    let listaAteCurrent = listaSemanaBloco

    listaAteCurrent = [...listaAteCurrent].splice(0,IndexCurrentBloco)

    this.getInfoBlocoAtracao(currentBloco,diaDaSemanaValue,IndexCurrentBloco)

    function add(accumulator, a) {
      return accumulator + a;
    }

    let valueToScroll = sts.sumItemsOnArray(listaAteCurrent.map(prog=>prog.tempoTotalEmSegundos))/10

    setTimeout(()=>{
      document.getElementsByClassName("col-11")[0].scrollLeft = valueToScroll
    },100)
  }
  
}



