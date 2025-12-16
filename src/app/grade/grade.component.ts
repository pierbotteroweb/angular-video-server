import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CommonService } from 'src/services/common.service';
import { EMPTY, Subject } from 'rxjs';
import { MongodbService } from '../services/mongodb.service';
import { FirebaseService } from '../services/firebase.service';
import { sts } from 'shuffle-tv-services/lib'
import { Bloco, Canal, DiaDaSemana, DiaDaSemanaProgramaMontado, ListaParaDesuso, Programa, ProgramasPorBloco, TipoDePrograma } from './types/types';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.scss']
})
export class GradeComponent implements OnInit {
  programaDeTv: Programa[];

  programaDeTvFiltered: Programa[];

  selectedProgramaDeTv: any;
  selectedProgramaDeTvBlocos: any;
  selectedCanal: string = "Globo";
  selectedDiaDaSemana: DiaDaSemana;
  selectedDiaDestinoDaSemana: DiaDaSemana;


  listaCanal:Bloco[];
  listaOrigemReduzida: Array<any>;
  listaParaUpdate: any;
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

  //  ESSAS VARIAVEIS NAO SAO RELACIONADAS COM A MUDANCA DE BLOCO PARA PROGRAMA MONTADO
  listaAnexosBloco:Array<string>=[];
  listaProgramasBlocos:Array<any>=[];
  blocosAmount:number;
  programasBlocosCount:number;
  programasPorBloco:ProgramasPorBloco;
  //  ESSAS VARIAVEIS NAO SAO RELACIONADAS COM A MUDANCA DE BLOCO PARA PROGRAMA MONTADO

  spyListaAdicionada: Subject<any>;
  spyListaReplicada: Subject<any>;

  getInfoClicado:boolean;
  getInfoProgramaMontadoClicado:boolean;
  getInfoFromProgramaMontadoClicado:boolean;
  unsubscribeGetProgramasDeTv:any;
  listaParaDesuso:ListaParaDesuso = {
    "dublado":[],
    "intervalos":[],
    "originais":[],
    "noite":[],
    "madrugada":[],
    "novelas":[],
    "movies":[],
  };

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
  programaMontadoSelectionado:any;
  selectVideoForm :FormGroup
  novoPrograma:FormControl
  duracaoEstimada:FormControl
  listaDeNomesDosDiasDaSemana:Array<DiaDaSemanaProgramaMontado>
  listaDeNomesDosDiasDaSemanaSemProgramaMontado:Array<DiaDaSemana>
  horas:any = []
  canais: Array<any>

  ngOnInit(): void {

    this.listaDeNomesDosDiasDaSemanaSemProgramaMontado = ["segunda","terca","quarta","quinta","sexta","sabado","domingo"]
    this.listaDeNomesDosDiasDaSemana =  ["segunda","terca","quarta","quinta","sexta","sabado","domingo", "segundaProgramaMontado","tercaProgramaMontado","quartaProgramaMontado","quintaProgramaMontado","sextaProgramaMontado","sabadoProgramaMontado","domingoProgramaMontado"]

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
      this.canais = data.sort(sts.sortPor("canal"))
      this.displaySelectedCanalInfo()
      this.canais.map(canal=>{
        this.gerarListasDeProgramasMontados(canal.emissora)
      })
      unsubscribe.unsubscribe()
    })
  }
  
  removePrograma(){
    if(this.selectedDiaDaSemana&&this.programaClicado){
      let indexToRemove = this.programaClicado.indice+1
      let itemRemoved = this.listaCanal[this.selectedDiaDaSemana][this.programaClicado.indice]
      this.alerta="Item Removido"
      setTimeout(()=>{this.alerta=""},1000)
      itemRemoved.added=false
      this.updateOnMongoDB(itemRemoved,"itemRemoved")

      if(this.listaCanal[this.selectedDiaDaSemana].length>1){
        let novaListaCanal:Bloco[] = [...this.listaCanal[this.selectedDiaDaSemana].slice(0,indexToRemove-1),
                       ...this.listaCanal[this.selectedDiaDaSemana].slice(indexToRemove)] 
        this.recalculaHorariosDeExibicao(novaListaCanal)
      }else{
        this.listaCanal[this.selectedDiaDaSemana]=[]
      }

    } else if(this.programaMontadoSelectionado){

      this.programaMontadoSelectionado.blocos.map(prog=>{
        prog.added=false
        this.updateOnMongoDB(prog,"prog")
      })
      
      let novaListaCanal = this.listaCanal[this.selectedDiaDaSemana]
                    .filter(prog=>prog.idProgTotal!==this.programaMontadoSelectionado.blocos[0].idProgTotal)

      this.recalculaHorariosDeExibicao(novaListaCanal)

      let novaListaCanalProgramaMontado = this.listaCanal[this.selectedDiaDaSemana+'ProgramaMontado']
                    .filter(prog=>prog.idProgTotal!==this.programaMontadoSelectionado.blocos[0].idProgTotal)
      
      this.listaCanal[this.selectedDiaDaSemana+'ProgramaMontado'] = novaListaCanalProgramaMontado


    } else if(!this.programaClicado){
      this.alerta="Selecione programa a ser deletado"
    } else if(!this.selectedDiaDaSemana){
      this.alerta="Informe o dia da semana"
    } else if(!this.programaClicado){
      this.alerta="Selecione programa a ser deletado"
    }
  }

  organizaIntervalos(){
    let listaParaORganizar = this.emProcessoDeUpdate ? this.listaParaUpdate : this.listaCanal[this.selectedDiaDaSemana]
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
    let listaParaORganizar = this.emProcessoDeUpdate? this.listaParaUpdate : this.listaCanal[this.selectedDiaDaSemana]
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

    let listaParaORganizar = this.emProcessoDeUpdate? this.listaParaUpdate : this.listaCanal[this.selectedDiaDaSemana]

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

  recalculaHorariosDeExibicao(novaListaCanal){
    let diaDaSemana = this.selectedDiaDestinoDaSemana?
    this.selectedDiaDestinoDaSemana:this.selectedDiaDaSemana

    novaListaCanal[0]['horarioDeExibicao']="06:30:00"
    
    if(novaListaCanal.length>=1){
      novaListaCanal.map((prog,index)=>{
        if(index>0){
          let progAnterior = novaListaCanal[index-1]
          prog.indice = index
          prog.horarioDeExibicao= 
            sts.toTime(progAnterior.duracaoTotalDaAtracaoEmSegundos
            +sts.toSeconds(progAnterior.horarioDeExibicao))
        }
      })
    } 

    if(this.emProcessoDeUpdate){
      this.listaParaUpdate= novaListaCanal
    } else {
      this.listaCanal[diaDaSemana]=novaListaCanal
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
        this.lengthListaFinal = novaListaCanal.length
        if(!this.prePosAvailable){
          this.selectVideoForm.get('programaDeTvFormControl')
          .setValue(sts.lowerCaseFirstChar(this.selectedProgramaDeTv.value.replace("int","")))
        }
        this.organizaIntervalos()
      } else if(novaListaCanal.length==this.lengthListaFinal&&this.prePosAvailable){
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
      if(!video.added){
        this.listaParaDesuso[video.tipo].push(video.id)
      }
    });
    
  }

  updateCanaisOnMongoDB(canal:Canal):void {
    this.mongodbService.updateCanais(canal).subscribe(() => {
      console.log("lista Canal", this.listaCanal[this.selectedDiaDaSemana])
      console.log('Canal updated successfully!');
      let listOfTypes = 
      [...new Set(this.listaCanal[this.selectedDiaDaSemana]
      .map((bloco:Bloco)=>bloco.tipo))]

      listOfTypes.forEach((tipo:TipoDePrograma)=>{
        let idsDeArquivosDoMesmoTipo = [...new Set(this.listaCanal[this.selectedDiaDaSemana]
        .filter((bloco:Bloco)=>bloco.tipo == tipo).map((bloco:Bloco)=>bloco.id))]

        this.mongodbService
        .updateMany(idsDeArquivosDoMesmoTipo, { emUso: true }, tipo)
        .pipe(
          concatMap(() => {
      
            if (this.listaParaDesuso[tipo].length===0) {
              return EMPTY;
            }

            return this.mongodbService.updateMany(
              this.listaParaDesuso[tipo],
              { emUso: false },
              tipo
            );
          })
        )
        .subscribe({
          next: () => {
            console.log("items removed");
            console.log("All Done");
          },
          error: (err) => {
            console.error("Erro no fluxo updateMany", err);
          }
        });

      })
    });
    
  }

  addIntervalo(intAmount,intApi){
    let listaAtual = this.emProcessoDeUpdate ? this.listaParaUpdate:
                     this.listaCanal[this.selectedDiaDaSemana]
    let info = listaAtual[this.indexToAdd]
    this.clickAtracao(info,this.selectedDiaDaSemana,this.indexToAdd)
    this.selectVideoForm.get('programaDeTvFormControl').setValue(intApi)
    this.adicionarPrograma()
    this.intervalosCount--
  }

  addPrePos(prePosApi){
    this.lengthListaFinal++

    let listaAtual = this.emProcessoDeUpdate ? this.listaParaUpdate:
                     this.listaCanal[this.selectedDiaDaSemana]
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

    if(this.selectedProgramaDeTv.anexos?.blocosAmount&&this.listaAnexosBloco.length==0){
      this.programasPorBloco={}
      this.blocosAmount=this.selectedProgramaDeTv.anexos.blocosAmount
      this.selectedProgramaDeTvBlocos=this.selectedProgramaDeTv
      for(let i=0;i<this.blocosAmount;i++){
        this.selectedProgramaDeTv.anexos["bloco"+(i+1)].map((valueProgramaBloco:string,index)=>{
          this.listaAnexosBloco.push(valueProgramaBloco)
          this.programasPorBloco["bloco"+(i+1)]=index+1
        })
      }
      this.programasBlocosCount=this.listaAnexosBloco.length
    }

    if(this.selectedProgramaDeTv.tipo!=="intervalos"
     &&!this.listaAnexosBloco.includes(this.selectedProgramaDeTv.value)){
      this.idProgTotal =  this.selectedProgramaDeTv.value+new Date().valueOf()
    }

    
    this.unsubscribeGetProgramasDeTv =
    this.mongodbService.getProgramasDeTv(this.selectedProgramaDeTv.tipo,this.selectedProgramaDeTv.value)
    .subscribe((listaDeProgramas:any ) => {

      //GET EACH REF ON THE LISTA DE PROGRAMAS AND CREATE A NEW LIST WITH THE PROGRAMAS DATA
      this.montaLista(listaDeProgramas)
    });

     if(!this.programaClicado){
      this.alerta="Selecione programa a ser deletado"
    }
  }
  
  montaLista = (listaDeProgramas)=>{
    let videoSendoAdicionado

    //FILTER 
    let listaDeProgramasFiltrada = listaDeProgramas.filter(video=>video.order&&!video.added)
      .sort(sts.sortPor("order"))
      
      
      
      if(listaDeProgramasFiltrada.length>0){

                let prog:any = this.selectedProgramaDeTv
                
                if(!this.prePosAvailable&&prog.anexos&&prog.anexos.prePos){
                  this.prePosApi=prog.anexos.prePos
                  this.prePosAvailable=true
                  this.prePosCount=2
                }

                videoSendoAdicionado = listaDeProgramasFiltrada[0]

                // if(videoSendoAdicionado.tipo!="intervalos"&&!videoSendoAdicionado.titulo.includes("Int")){
                //   this.previousAddedOrderIndex=99999       
                // } 

                  let newProg:Object ={}
                  let newProgList: Array<any> =[]

                  if(videoSendoAdicionado.cortesParaIntervalo.length){
                    let cortes = videoSendoAdicionado.cortesParaIntervalo
                    this.intervalosCount = this.qtdeIntervalos = cortes.length
                    let progModel = {
                      "atracao":this.selectedProgramaDeTv.value,
                      "tituloAtracao":videoSendoAdicionado.tituloAtracao,
                      "titulo":videoSendoAdicionado.titulo,
                      "volume":videoSendoAdicionado.volume?videoSendoAdicionado.volume:1,
                      "horarioDeExibicao":"",
                      "id":videoSendoAdicionado._id,
                      "idProgTotal":this.idProgTotal,
                      "tipo":videoSendoAdicionado.tipo
                    }

                    let inicio = 0
                    if(videoSendoAdicionado.corteInicio){
                      inicio=videoSendoAdicionado.corteInicio
                    }

                    let final = cortes[0]

                    progModel['inicio']=inicio
                    progModel['final']=final
                    progModel['duracaoTotalDaAtracaoEmSegundos']=final-inicio
                    newProgList.push(progModel)

                    cortes.map((corte,index)=>{
                      let prog =  {
                        "atracao":this.selectedProgramaDeTv.value,
                        "tituloAtracao":videoSendoAdicionado.tituloAtracao,
                        "titulo":videoSendoAdicionado.titulo,
                        "volume":videoSendoAdicionado.volume?videoSendoAdicionado.volume:1,
                        "horarioDeExibicao":"",
                        "id":videoSendoAdicionado._id,
                        "idProgTotal":this.idProgTotal,
                        "tipo":videoSendoAdicionado.tipo
                      }
                      
                      if(index<cortes.length-1) {
                        prog['inicio']=cortes[index]
                        prog['final']=cortes[index+1]
                        prog['duracaoTotalDaAtracaoEmSegundos']=cortes[index+1]-cortes[index]
                        newProgList.push(prog)
                      } else {
                        let finalDoCorte = videoSendoAdicionado.corteFinal?videoSendoAdicionado.corteFinal:videoSendoAdicionado.duracao
                        prog['inicio']=cortes[index]
                        prog['final']=finalDoCorte
                        prog['duracaoTotalDaAtracaoEmSegundos']=finalDoCorte-cortes[index]
                        newProgList.push(prog)
                      }
                    })
                  } else {
                    newProg = {
                      "atracao":this.selectedProgramaDeTv.value,
                      "tituloAtracao":videoSendoAdicionado.tituloAtracao,
                      "titulo":videoSendoAdicionado.titulo,
                      "volume":videoSendoAdicionado.volume?videoSendoAdicionado.volume:1,
                      "horarioDeExibicao":"",
                      "duracaoTotalDaAtracaoEmSegundos": videoSendoAdicionado.duracao,
                      "id":videoSendoAdicionado._id,
                      "idProgTotal":this.idProgTotal,
                      "tipo":videoSendoAdicionado.tipo
                    }

                    if(videoSendoAdicionado.corteFinal){
                      let corteFinal = videoSendoAdicionado.corteFinal
                      newProg['corteFinal']=corteFinal
                      newProg['duracaoTotalDaAtracaoEmSegundos']=corteFinal
                    }

                    if(videoSendoAdicionado.corteInicio){
                      let corteInicio = videoSendoAdicionado.corteInicio
                      let duracao = videoSendoAdicionado.corteInicio
                      newProg['corteInicio']=duracao-corteInicio
                    }
                  }

                  let listInProcess:Array<Canal> = this.emProcessoDeUpdate ? this.listaParaUpdate : this.listaCanal[this.selectedDiaDaSemana]
                  videoSendoAdicionado.added=true
                  this.updateOnMongoDB(videoSendoAdicionado,"videoSendoAdicionado")        

                  this.indexToAdd = this.programaClicado ? this.programaClicado.indice+1 : listInProcess.length
                  let novaListaCanal
                  if(newProgList.length>0){
                    novaListaCanal = [...listInProcess.slice(0,this.indexToAdd),
                               ...newProgList,...listInProcess.slice(this.indexToAdd)]
                  } else {
                    novaListaCanal = [...listInProcess.slice(0,this.indexToAdd),
                               newProg,...listInProcess.slice(this.indexToAdd)]
                  }
                  if(!this.intervalosCount&&!this.prePosCount){
                    this.clearInfoAtracao()
                  }
                  this.unsubscribeGetProgramasDeTv.unsubscribe()
                  this.recalculaHorariosDeExibicao(novaListaCanal)
      } else {
        this.resetAddedLista(listaDeProgramas, "programa")
        this.unsubscribeGetProgramasDeTv.unsubscribe()
      }
  }

  adicionarProgramaBloco(bloco): void {
    
    let unsubscribe=
    this.mongodbService.getProgramasDeTv("dublado",bloco)
    .subscribe((data:any ) => {
      let videoSendoAdicionado

      let listaDeProgramas = data

      //GET EACH REF ON THE LISTA DE PROGRAMAS AND CREATE A NEW LIST WITH THE PROGRAMAS DATA

      const montaLista = ()=>{

        //FILTER 
        let listaDeProgramasFiltrada = listaDeProgramas.filter(video=>video.order&&!video.added)
          .sort(sts.sortPor("order"))
                    if(listaDeProgramasFiltrada.length>0){
                      videoSendoAdicionado = listaDeProgramasFiltrada[0]
                    } else{
                      videoSendoAdicionado = listaDeProgramas[0]
                      if(listaDeProgramas.length>1){
                        this.resetAddedLista(listaDeProgramas.splice(1,listaDeProgramas.length),"blocos")                      
                      }
                    }console.log("videoSendoAdicionado ",videoSendoAdicionado)

                    if(videoSendoAdicionado.tipo=="intervalos") console.log("videoSendoAdicionado ",videoSendoAdicionado)

                      let newProg:Object ={}

                        newProg = {
                          "atracao":bloco,
                          "tituloAtracao":videoSendoAdicionado.tituloAtracao,
                          "titulo":videoSendoAdicionado.titulo,
                          "volume":videoSendoAdicionado.volume?videoSendoAdicionado.volume:1,
                          "horarioDeExibicao":"",
                          "duracaoTotalDaAtracaoEmSegundos": videoSendoAdicionado.duracao,
                          "id":videoSendoAdicionado._id,
                          "idProgTotal":this.idProgTotal,
                          "tipo":videoSendoAdicionado.tipo
                        }

                        if(videoSendoAdicionado.corteFinal){
                          let corteFinal = videoSendoAdicionado.corteFinal
                          newProg['corteFinal']=corteFinal
                          newProg['duracaoTotalDaAtracaoEmSegundos']=corteFinal
                        }
  
                        if(videoSendoAdicionado.corteInicio){
                          let corteInicio = videoSendoAdicionado.corteInicio
                          let duracao = videoSendoAdicionado.corteInicio
                          newProg['corteInicio']=duracao-corteInicio
                        }
                      videoSendoAdicionado.added=true
                      this.updateOnMongoDB(videoSendoAdicionado,"videoSendoAdicionado")
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
      
      this.listaCanal[this.selectedDiaDaSemana] = this.listaParaUpdate
      this.listaParaUpdate=[]
      this.emProcessoDeUpdate=false
    } else {

      this.programasReplicadosCount--
      let programaParaReplicar = this.listaCanal[this.selectedDiaDaSemana]
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
      return Promise.all(this.listaAnexosBloco.map(bloco => asyncFunctionThatCallsFunction(bloco)))
    }
    
    getAllBlocos().then(data => {
        // this.adicionarPrograma()
        this.programasBlocosCount=0
        this.listaAnexosBloco=[]
        this.organizaProgramasBlocos()
    }) 
  }

  subirLista(){
    localStorage.setItem('data',JSON.stringify(this.listaCanal))
    let canal:Canal =  this.canais.filter((canal:Canal)=>canal.emissora==this.selectedCanal)[0]
    this.updateCanaisOnMongoDB(canal)
    this.listaDeNomesDosDiasDaSemana.map((dia:DiaDaSemana)=>{
      if(this.listaCanal[dia]){
      }
    })
  }

  getLista(){
      this.listaCanal = this.canais.find(canal=>canal.emissora==this.selectedCanal)
      console.log(this.selectedDiaDaSemana)
      if(this.selectedDiaDaSemana&&!this.listaCanal[this.selectedDiaDaSemana]) this.addDiasDeSemanaNoCanal()
      this.getListaDeProgramasDeTvFromMongodb()
  }

  addDiasDeSemanaNoCanal(){
    console.log("????")
    this.listaDeNomesDosDiasDaSemana.map((dia:DiaDaSemana)=>{
      this.listaCanal[dia]=[]
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

  getStyleProgramaMontado(width,dia,index?){
    if(this.programaMontadoSelectionado&&
      (this.programaMontadoSelectionado.indice==index)&&
      (this.programaMontadoSelectionado.dia==dia)){
      return `width:${width/10}px;background:blue`
    } else {      
      return `width:${width/10}px`
    }
  }

  getInfoProgramaMontado(info,dia,index){
    this.getInfoClicado=false
    this.getInfoProgramaMontadoClicado=true
    this.getInfoFromProgramaMontadoClicado=false
    this.alerta=""
    this.programaClicado=""
    if(this.programaMontadoSelectionado==info){
      this.programaMontadoSelectionado=""
    }else{
      info.indice=index
      info.dia=dia
      this.programaMontadoSelectionado = info
      this.selectedDiaDaSemana = dia
    }
  }

  clickAtracao(info,dia,index){
    this.getInfoClicado=true
    this.getInfoProgramaMontadoClicado=false
    this.getInfoFromProgramaMontadoClicado=false
    this.alerta=""
    this.programaMontadoSelectionado=""
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

  clickAtracaoFromProgramaMontado (info,dia,index){

    this.getInfoFromProgramaMontadoClicado=true
    this.programaClicado = info

  }

  clearInfoAtracao(){
      this.programaClicado=""
  }

  toggleSemanaDestino(){
    this.exibeSemanaDestino=!this.exibeSemanaDestino
    this.selectedDiaDestinoDaSemana=null
    this.emProcessoDeUpdate=false
    this.selectVideoForm.get('semanaDestinoFormControl').setValue("")
  }

  replicaListaDaSemana(){
    this.programaClicado=""
    if(this.selectedDiaDestinoDaSemana){
      this.listaCanal[this.selectedDiaDestinoDaSemana]=[]
      let listaOrigem = this.listaCanal[this.selectedDiaDaSemana] 
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
    let listaOrigem = this.listaCanal[this.selectedDiaDaSemana] 
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

  gerarListasDeProgramasMontados(emissora){
      let canal:Canal = this.canais.find(canal=>canal.emissora==emissora)
      let indexOfCanal:number = this.canais.indexOf(canal)


      this.listaDeNomesDosDiasDaSemana.map((diaDaSemana:DiaDaSemana)=>{
        let listaOriginal:any = canal[diaDaSemana]
        if(listaOriginal){
        let listaDiaReduzida = [...new Set(listaOriginal.map(prog=>prog.idProgTotal))]

        let listaAnexosBloco = listaDiaReduzida.map((progId:any)=>{
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
        this.canais[indexOfCanal][diaDaSemana+"ProgramaMontado"]=listaAnexosBloco}
      })

        this.listaCanal = this.canais[indexOfCanal][this.listaDeNomesDosDiasDaSemana[this.selectedDiaDaSemana]]
  }

  displaySelectedCanalInfo(){
    this.firebaseService.getSeletorDeCanal()
    .snapshotChanges()
    .subscribe(change=>{

        let canal =  change[0].payload._delegate.doc._document.data.value.mapValue.fields.canal.integerValue   
        const newDate = new Date();

        this.findSelectedCanalId(canal)

        this.findDiaDaSemanaValue(newDate)

        this.scrollTocurrentProgramaMontado(canal,newDate)

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
    diaDaSemanaValue = this.listaDeNomesDosDiasDaSemana[indexSemana]
    this.setSemanaForm(diaDaSemanaValue)
  }

  setSemanaForm(diaDaSemanaValue){        
    this.selectVideoForm.get('semanaFormControl').setValue(diaDaSemanaValue)
  }

  scrollTocurrentProgramaMontado(canal,newDate){

    let diaDaSemanaValue = this.selectVideoForm.get('semanaFormControl').value
    let listaCanalProgramaMontado = this.canais.filter(canalMapeado=>canalMapeado.canal==canal)[0][diaDaSemanaValue+"ProgramaMontado"]
    var time = newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds();

    let currentProgramaMontado
    let now = newDate.toLocaleTimeString()
    let sixThiryAm = sts.toSeconds("06:00:00")

    if(sts.toSeconds(now)<=sixThiryAm){
      currentProgramaMontado = listaCanalProgramaMontado.find(programaMontado=>{ 
        let tempoTotalEmSegundosDoProgramaMontado = sts.toSeconds(programaMontado.horarioDeExibicao)+programaMontado.tempoTotalEmSegundos
        return tempoTotalEmSegundosDoProgramaMontado < sixThiryAm && tempoTotalEmSegundosDoProgramaMontado > sts.toSeconds(time)
     })
    } else {
      currentProgramaMontado = listaCanalProgramaMontado.find(programaMontado=>{ 
        return (sts.toSeconds(programaMontado.horarioDeExibicao)+programaMontado.tempoTotalEmSegundos)>
       sts.toSeconds(time)
     })
    }
    
    let IndexCurrentProgramaMontado = listaCanalProgramaMontado.indexOf(currentProgramaMontado)

    let listaAteCurrent = listaCanalProgramaMontado.slice(0, IndexCurrentProgramaMontado)


    this.getInfoProgramaMontado(currentProgramaMontado,diaDaSemanaValue,IndexCurrentProgramaMontado)

    function add(accumulator, a) {
      return accumulator + a;
    }

    let valueToScroll = sts.sumItemsOnArray(listaAteCurrent.map(prog=>prog.tempoTotalEmSegundos))/10

    setTimeout(()=>{
      document.getElementsByClassName("col-11")[0].scrollLeft = valueToScroll
    },100)
  }
  
}


// canais: Um Array correspondente a collection completa canais. Cada documents da colection é 
// correspondente a um canal. E cada dia da semana é uma propriedade desse Objeto. E tem outras 
// propriedades com o nome da semana seguido de "Bloco". Por exemplo "terca" e "tercaBloco".
// Alem dessas propriedades, tem tambem as propriedades "canal" e "emissora". 
// Por exemplo canal 2, emissora Cultura.

// listaCanal: Corresponde a um ITEM de um document da colection Canais. Esse ITEM é um array de Blocos,
// Esse ITEM tem nome de um dia da semana sem a string "Bloco" no nome. Por exemplo "terca".

// novaListaCanal: essa é a listaCanal recalculada apos um bloco ser adicionado ou removido.