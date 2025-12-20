import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EMPTY, Subject, Subscription } from 'rxjs';
import { MongodbService } from '../services/mongodb.service';
import { FirebaseService } from '../services/firebase.service';
import { sts } from 'shuffle-tv-services/lib'
import { Anexos, Arquivo, Bloco, BlocoMontado, Canal, DiaDaSemana, DiaDaSemanaProgramaMontado, Emissora, InfoIntPrePos, ListaParaDesuso, Programa, ProgramasPorBloco, TipoDePrograma } from './types/types';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.scss']
})
export class GradeComponent implements OnInit {
  programaDeTv: Programa[];

  programaDeTvFiltered: Programa[];

  selectedProgramaDeTv: Programa;
  selectedProgramaDeTvBlocos: Programa;
  selectedCanal: Emissora = "Globo";
  selectedDiaDaSemana: DiaDaSemana;
  selectedDiaDestinoDaSemana: DiaDaSemana;


  listaCanal: Canal = {} as Canal;
  listaIdsProgramaMontado: Array<string>;
  listaParaUpdate: Bloco[];
  idProgMontado: string;

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

  listaAnexosBloco:string[]=[];
  listaProgramasBlocos:Array<Bloco>=[];
  blocosAmount:number;
  programasBlocosCount:number;
  programasPorBloco:ProgramasPorBloco;

  spyListaAdicionada: Subject<InfoIntPrePos>;
  spyListaReplicada: Subject<string>;

  getInfoClicado:boolean;
  getInfoProgramaMontadoClicado:boolean;
  getInfoFromProgramaMontadoClicado:boolean;
  unsubscribeGetProgramasDeTv:Subscription;
  listaParaDesuso:ListaParaDesuso = {
    "dublado":[],
    "intervalos":[],
    "originais":[],
    "noite":[],
    "madrugada":[],
    "novelas":[],
    "movies":[],
  };

  constructor(private firebaseService: FirebaseService,
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

  blocoClicado: Bloco | null = null;
  programaMontadoSelectionado:BlocoMontado | null = null;
  selectVideoForm :FormGroup
  novoPrograma:FormControl
  duracaoEstimada:FormControl
  listaDeNomesDosDiasDaSemana:Array<DiaDaSemanaProgramaMontado>
  listaDeNomesDosDiasDaSemanaSemProgramaMontado:Array<DiaDaSemana>
  horas:string[] = []
  canais: Canal[]

  ngOnInit(): void {

    this.listaDeNomesDosDiasDaSemanaSemProgramaMontado = ["segunda","terca","quarta","quinta","sexta","sabado","domingo"]
    this.listaDeNomesDosDiasDaSemana =  ["segunda","terca","quarta","quinta","sexta","sabado","domingo", "segundaProgramaMontado","tercaProgramaMontado","quartaProgramaMontado","quintaProgramaMontado","sextaProgramaMontado","sabadoProgramaMontado","domingoProgramaMontado"]

    this.exibeSemanaDestino=false
    this.spyListaAdicionada = new Subject()
    this.spyListaAdicionada.subscribe((info:InfoIntPrePos)=>{
      if(this.intervalosCount){
        setTimeout(()=>{
          this.addIntervalo((info.intAmount+2),info.intervaloApi)
        },500)
      } else if(this.prePosCount){
        this.addPrePos(info.prePosApi)
      }
    })

    
    this.spyListaReplicada = new Subject()
    this.spyListaReplicada.subscribe((programaDeTvValue)=>{
      if(this.programasReplicadosCount>=0){
        this.selectVideoForm.get('programaDeTvFormControl').setValue(programaDeTvValue)
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
    this.mongodbService.getCanais().subscribe((canais:Canal[] )=>{ 
      this.canais = canais.sort(sts.sortPor("canal"))
      this.displaySelectedCanalInfo()
      this.canais.map(canal=>{
        this.gerarListasDeProgramasMontados(canal.emissora)
      })
      unsubscribe.unsubscribe()
    })
  }
  
  removePrograma(){
    if(this.selectedDiaDaSemana&&this.blocoClicado){
      let indexToRemove = this.blocoClicado.indice+1
      let blocoSendoRemovido:Bloco = this.listaCanal[this.selectedDiaDaSemana][this.blocoClicado.indice]
      this.alerta="Item Removido"
      setTimeout(()=>{this.alerta=""},1000)
      blocoSendoRemovido.added=false
      this.updateArquivoOnMongoDB(blocoSendoRemovido)

      if(this.canal[this.selectedDiaDaSemana].length>1){
        let novaListaCanal:Bloco[] = [...this.canal[this.selectedDiaDaSemana].slice(0,indexToRemove-1),
                       ...this.canal[this.selectedDiaDaSemana].slice(indexToRemove)] 
        this.recalculaHorariosDeExibicao(novaListaCanal)
      }else{
        this.canal[this.selectedDiaDaSemana]=[]
      }

    } else if(this.programaMontadoSelectionado){

      this.programaMontadoSelectionado.blocos.map((arquivo:Bloco)=>{
        arquivo.added=false
        this.updateArquivoOnMongoDB(arquivo)
      })
      
      let novablocosDiaDaSemana = this.canal[this.selectedDiaDaSemana]
                    .filter(prog=>prog.idProgMontado!==this.programaMontadoSelectionado.blocos[0].idProgMontado)

      this.recalculaHorariosDeExibicao(novablocosDiaDaSemana)

      let novaListaCanalProgramaMontado = this.canal[this.selectedDiaDaSemana+'ProgramaMontado']
                    .filter(prog=>prog.idProgMontado!==this.programaMontadoSelectionado.blocos[0].idProgMontado)
      
      this.canal[this.selectedDiaDaSemana+'ProgramaMontado'] = novaListaCanalProgramaMontado


    } else if(!this.blocoClicado){
      this.alerta="Selecione programa a ser deletado"
    } else if(!this.selectedDiaDaSemana){
      this.alerta="Informe o dia da semana"
    } else if(!this.blocoClicado){
      this.alerta="Selecione programa a ser deletado"
    }
  }

  organizaIntervalos(){
    let listaParaORganizar:Bloco[] = this.emProcessoDeUpdate ? this.listaParaUpdate : this.listaCanal[this.selectedDiaDaSemana]
    let lengthListaParaOrganizar = listaParaORganizar.length
    
    let indexInicioAdicionados=listaParaORganizar.find(prog=>prog.idProgMontado==this.idProgMontado).indice

    let indexFinalAdicionados=listaParaORganizar.reverse().find(prog=>prog.idProgMontado==this.idProgMontado).indice

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
    let listaParaORganizar = this.emProcessoDeUpdate? this.listaParaUpdate : this.canal[this.selectedDiaDaSemana]
    let lengthListaParaOrganizar = listaParaORganizar.length
    
    let indexInicioAdicionados=listaParaORganizar.indexOf(listaParaORganizar.find(prog=>prog.idProgMontado==this.idProgMontado))

    // listaParaORganizar.reverse()

        
    let listaAdicionados = listaParaORganizar.filter(prog=>prog.idProgMontado==this.idProgMontado)

    let indexFinalAdicionados=indexInicioAdicionados+listaAdicionados.length-2
    let listaPreAdicionados = listaParaORganizar.slice(0,indexInicioAdicionados)
    
    let listaAadicionadosPrograma = listaAdicionados.filter(prog=>!prog.atracao.includes("prePos"))
    let listaAadicionadosPrepos = listaAdicionados.filter(prog=>prog.atracao.includes("prePos"))
    let listaPosAdicionados = listaParaORganizar.slice(indexFinalAdicionados+1,lengthListaParaOrganizar).filter(prog=>prog.idProgMontado!=this.idProgMontado)

    let listaFinal = [...listaPreAdicionados,
                     listaAadicionadosPrepos[0],
                      ...listaAadicionadosPrograma,
                      listaAadicionadosPrepos[1],
                      ...listaPosAdicionados]
                      
    this.prePosCount=0
    this.prePosAvailable=false
    this.blocoClicado=null

      this.recalculaHorariosDeExibicao(listaFinal) 
  }

  organizaProgramasBlocos(){

    let listaParaORganizar = this.emProcessoDeUpdate? this.listaParaUpdate : this.canal[this.selectedDiaDaSemana]

    let indexAdicionadosInicio = listaParaORganizar.indexOf(listaParaORganizar.find(prog=>prog.idProgMontado==this.idProgMontado))

    let listaPreAdicionados = listaParaORganizar.slice(0,indexAdicionadosInicio)

    let listaAdicionados=listaParaORganizar.filter(prog=>prog.idProgMontado==this.idProgMontado)

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

  recalculaHorariosDeExibicao(novaListaCanal:Bloco[]){
    let diaDaSemana:DiaDaSemana = this.selectedDiaDestinoDaSemana?
    this.selectedDiaDestinoDaSemana:this.selectedDiaDaSemana

    novablocosDiaDaSemana[0]['horarioDeExibicao']="06:30:00"
    
    if(novaListaCanal.length>=1){
      novaListaCanal.map((bloco:Bloco,index)=>{
        if(index>0){
          let blocoAnterior:Bloco = novaListaCanal[index-1]
          bloco.indice = index
          bloco.horarioDeExibicao= 
            sts.toTime(blocoAnterior.duracaoTotalDaAtracaoEmSegundos
            +sts.toSeconds(blocoAnterior.horarioDeExibicao))
        }
      })
    }

    if(this.emProcessoDeUpdate){
      this.listaParaUpdate= novablocosDiaDaSemana
    } else {
      this.canal[diaDaSemana]=novablocosDiaDaSemana
    }

    if(this.selectedProgramaDeTv){
    
      let intervaloApi:string
  
      if(this.selectedProgramaDeTv.tipo=="intervalos"&&this.selectedProgramaDeTv.prePos==false){
        intervaloApi = this.selectedProgramaDeTv.value
      } else if(this.selectedProgramaDeTv.anexos&&this.selectedProgramaDeTv.anexos.intervalo){
        intervaloApi = this.selectedProgramaDeTv.anexos.intervalo
      }
  
      if(this.intervalosCount){
        let intInfo:InfoIntPrePos = {
          intAmount: this.intervalosCount,
          intervaloApi: intervaloApi
        }
  
        this.spyListaAdicionada.next(intInfo)
      } else if(this.qtdeIntervalos){
        this.lengthListaFinal = novablocosDiaDaSemana.length
        if(!this.prePosAvailable){
          this.selectVideoForm.get('programaDeTvFormControl')
          .setValue(sts.lowerCaseFirstChar(this.selectedProgramaDeTv.value.replace("int","")))
        }
        this.organizaIntervalos()
      } else if(novablocosDiaDaSemana.length==this.lengthListaFinal&&this.prePosAvailable){
        if(this.prePosCount>0){
          let prePosInfo:InfoIntPrePos = {
          intAmount: this.prePosCount,
          prePosApi: this.prePosApi
        }
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

  updateArquivoOnMongoDB(arquivo):void {

    this.mongodbService.updateVideo(arquivo._id,arquivo).subscribe(() => {
      if(!arquivo.added){
        this.listaParaDesuso[arquivo.tipo].push(arquivo.id)
      }
    });
    
  }

  updateCanaisOnMongoDB(canal:Canal):void {
    this.mongodbService.updateCanais(canal).subscribe(() => {
      let listOfTypes = 
      [...new Set(this.canal[this.selectedDiaDaSemana]
      .map((bloco:Bloco)=>bloco.tipo))]

      listOfTypes.forEach((tipo:TipoDePrograma)=>{
        let idsDeArquivosDoMesmoTipo = [...new Set(this.canal[this.selectedDiaDaSemana]
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
                     this.canal[this.selectedDiaDaSemana]
    let info = listaAtual[this.indexToAdd]
    this.clickBloco(info,this.selectedDiaDaSemana,this.indexToAdd)
    this.selectVideoForm.get('programaDeTvFormControl').setValue(intApi)
    this.adicionarPrograma()
    this.intervalosCount--
  }

  addPrePos(prePosApi){
    this.lengthListaFinal++

    let listaAtual = this.emProcessoDeUpdate ? this.listaParaUpdate:
                     this.canal[this.selectedDiaDaSemana]
    let indexToSelect = listaAtual.indexOf(listaAtual.find(prog=>prog.idProgMontado==this.idProgMontado))
    let bloco:Bloco = listaAtual[indexToSelect]
    this.clickBloco(bloco,this.selectedDiaDaSemana,indexToSelect)
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
      this.idProgMontado =  this.selectedProgramaDeTv.value+new Date().valueOf()
    }

    
    this.unsubscribeGetProgramasDeTv =
    this.mongodbService.getProgramasDeTv(this.selectedProgramaDeTv.tipo,this.selectedProgramaDeTv.value)
    .subscribe((listaDeProgramas:any ) => {
      console.log("listaDeProgramas",listaDeProgramas)

      //GET EACH REF ON THE LISTA DE PROGRAMAS AND CREATE A NEW LIST WITH THE PROGRAMAS DATA
      this.montaLista(listaDeProgramas)
    });

     if(!this.blocoClicado){
      this.alerta="Selecione programa a ser deletado"
    }
  }
  
  montaLista = (listaDeProgramas)=>{
    let videoSendoAdicionado

    //FILTER 
    let listaDeProgramasFiltrada = listaDeProgramas.filter(video=>video.order&&!video.added)
      .sort(sts.sortPor("order"))
      
      
      
      if(listaDeProgramasFiltrada.length>0){

                let prog:Programa = this.selectedProgramaDeTv
                
                if(!this.prePosAvailable&&prog.anexos&&prog.anexos.prePos){
                  this.prePosApi=prog.anexos.prePos
                  this.prePosAvailable=true
                  this.prePosCount=2
                }

                videoSendoAdicionado = listaDeProgramasFiltrada[0]

                // if(videoSendoAdicionado.tipo!="intervalos"&&!videoSendoAdicionado.titulo.includes("Int")){
                //   this.previousAddedOrderIndex=99999       
                // } 

                  let newProg:Bloco
                  let newProgList:Bloco[]=[]

                  if(videoSendoAdicionado.cortesParaIntervalo.length){
                    let cortes:number[] = videoSendoAdicionado.cortesParaIntervalo
                    this.intervalosCount = this.qtdeIntervalos = cortes.length
                    let progModel:Bloco = {
                      "atracao":this.selectedProgramaDeTv.value,
                      "tituloAtracao":videoSendoAdicionado.tituloAtracao,
                      "titulo":videoSendoAdicionado.titulo,
                      "volume":videoSendoAdicionado.volume?videoSendoAdicionado.volume:1,
                      "duracaoTotalDaAtracaoEmSegundos":0,
                      "horarioDeExibicao":"",
                      "id":videoSendoAdicionado._id,
                      "idProgMontado":this.idProgMontado,
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
                    console.log("newProgList.push(progModel)",newProgList)
                    console.log("newProgList.push(progModel)",progModel)
                    newProgList.push(progModel)

                    cortes.map((corte,index)=>{
                      let prog:Bloco =  {
                        "atracao":this.selectedProgramaDeTv.value,
                        "tituloAtracao":videoSendoAdicionado.tituloAtracao,
                        "titulo":videoSendoAdicionado.titulo,
                        "volume":videoSendoAdicionado.volume?videoSendoAdicionado.volume:1,
                        "duracaoTotalDaAtracaoEmSegundos":0,
                        "horarioDeExibicao":"",
                        "id":videoSendoAdicionado._id,
                        "idProgMontado":this.idProgMontado,
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
                      "idProgMontado":this.idProgMontado,
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

                  let listInProcess:Bloco[] = this.emProcessoDeUpdate ? this.listaParaUpdate : this.listaCanal[this.selectedDiaDaSemana]
                  videoSendoAdicionado.added=true
                  this.updateArquivoOnMongoDB(videoSendoAdicionado)        

                  this.indexToAdd = this.blocoClicado ? this.blocoClicado.indice+1 : listInProcess.length
                  let novaListaCanal:Bloco[]

                  if(newProgList.length>0){
                    novaListaCanal = [...listInProcess.slice(0,this.indexToAdd),
                               ...newProgList,...listInProcess.slice(this.indexToAdd)]
                  } else {
                    novaListaCanal = [...listInProcess.slice(0,this.indexToAdd),
                               newProg,...listInProcess.slice(this.indexToAdd)]
                  }
                  if(!this.intervalosCount&&!this.prePosCount){
                    this.clearInfoBloco()
                  }
                  this.unsubscribeGetProgramasDeTv.unsubscribe()
                  this.recalculaHorariosDeExibicao(novaListaCanal)
      } else {
        this.resetAddedLista(listaDeProgramas, "programa")
        this.unsubscribeGetProgramasDeTv.unsubscribe()
      }
  }

  adicionarProgramaBloco(blocoId): void {
    
    let unsubscribe=
    this.mongodbService.getProgramasDeTv("dublado",blocoId)
    .subscribe((listaDeArquivos:Arquivo[] ) => {
      let arquivoSendoAdicionado:Arquivo

      //GET EACH REF ON THE LISTA DE PROGRAMAS AND CREATE A NEW LIST WITH THE PROGRAMAS DATA

      const montaLista = ()=>{

        //FILTER 
        let listaDeArquivosFiltrada:Arquivo[] = listaDeArquivos.filter((arquivo:Arquivo)=>arquivo.order&&!arquivo.added)
          .sort(sts.sortPor("order"))
                    if(listaDeArquivosFiltrada.length>0){
                      arquivoSendoAdicionado = listaDeArquivosFiltrada[0]
                    } else{
                      arquivoSendoAdicionado = listaDeArquivos[0]
                      if(listaDeArquivos.length>1){
                        this.resetAddedLista(listaDeArquivos.splice(1,listaDeArquivos.length),"blocos")                      
                      }
                    }

                      let novoBloco:Bloco = {
                        "atracao":blocoId,
                        "tituloAtracao":arquivoSendoAdicionado.tituloAtracao,
                        "titulo":arquivoSendoAdicionado.titulo,
                        "volume":arquivoSendoAdicionado.volume?arquivoSendoAdicionado.volume:1,
                        "horarioDeExibicao":"",
                        "duracaoTotalDaAtracaoEmSegundos": arquivoSendoAdicionado.duracao,
                        "id":arquivoSendoAdicionado._id,
                        "idProgMontado":this.idProgMontado,
                        "tipo":arquivoSendoAdicionado.tipo
                      }

                      if(arquivoSendoAdicionado.corteFinal){
                        let corteFinal:number = arquivoSendoAdicionado.corteFinal
                        novoBloco['corteFinal']=corteFinal
                        novoBloco['duracaoTotalDaAtracaoEmSegundos']=corteFinal
                      }

                      if(arquivoSendoAdicionado.corteInicio){
                        let corteInicio:number = arquivoSendoAdicionado.corteInicio
                        let duracao:number = arquivoSendoAdicionado.corteInicio
                        novoBloco['corteInicio']=duracao-corteInicio
                      }
                      arquivoSendoAdicionado.added=true
                      this.updateArquivoOnMongoDB(arquivoSendoAdicionado)
                      unsubscribe.unsubscribe()
                      this.listaProgramasBlocos.push(novoBloco)
            unsubscribe.unsubscribe()
      }
      montaLista()
    });
  }

  replicaNext(){
    this.blocoClicado=null

    if(this.programasReplicadosCount==0&&this.emProcessoDeUpdate){
      
      this.canal[this.selectedDiaDaSemana] = this.listaParaUpdate
      this.listaParaUpdate=[]
      this.emProcessoDeUpdate=false
    } else {

      this.programasReplicadosCount--
      let programaParaReplicar = this.listaCanal[this.selectedDiaDaSemana]
                            .find((bloco:Bloco)=>bloco.idProgMontado==
                            this.listaIdsProgramaMontado[this.programasReplicadosCount]&&
                            bloco.tipo!=="intervalos").atracao
  
      this.spyListaReplicada.next(programaParaReplicar)
    }
  }

  resetAddedLista(lista,type){
    const functionThatReturnsAPromise = video => {
      
      video.added=false
      this.updateArquivoOnMongoDB(video)
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
    localStorage.setItem('data',JSON.stringify(this.canal))
    let canal:Canal =  this.canais.filter((canal:Canal)=>canal.emissora==this.selectedCanal)[0]
    this.updateCanaisOnMongoDB(canal)
    this.listaDeNomesDosDiasDaSemana.map((dia:DiaDaSemana)=>{
      if(this.canal[dia]){
      }
    })
  }

  getLista(){
      this.canal = this.canais.find(canal=>canal.emissora==this.selectedCanal)
      if(this.selectedDiaDaSemana&&!this.canal[this.selectedDiaDaSemana]) this.addDiasDeSemanaNoCanal()
      this.getListaDeProgramasDeTvFromMongodb()
  }

  addDiasDeSemanaNoCanal(){
    this.listaDeNomesDosDiasDaSemana.map((dia:DiaDaSemana)=>{
      this.canal[dia]=[]
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
    if(this.blocoClicado&&(this.blocoClicado.indice==index)&&(this.blocoClicado.dia==dia)){
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
    this.blocoClicado=null
    if(this.programaMontadoSelectionado==info){
      this.programaMontadoSelectionado=null
    }else{
      info.indice=index
      info.dia=dia
      this.programaMontadoSelectionado = info
      this.selectedDiaDaSemana = dia
    }
  }

  clickBloco(bloco:Bloco,diaDaSemana:DiaDaSemana,index:number){
    this.getInfoClicado=true
    this.getInfoProgramaMontadoClicado=false
    this.getInfoFromProgramaMontadoClicado=false
    this.alerta=""
    this.programaMontadoSelectionado=null
    if(this.blocoClicado==bloco){
      this.blocoClicado=null
    }else{
      bloco.indice=index
      bloco.dia=diaDaSemana
      this.blocoClicado = bloco
      this.selectVideoForm.get('semanaFormControl').setValue(diaDaSemana)
      this.selectedDiaDaSemana = diaDaSemana
    }
  }

  clickBlocoFromProgramaMontado (bloco:Bloco){

    this.getInfoFromProgramaMontadoClicado=true
    this.blocoClicado = bloco

  }

  clearInfoBloco(){
      this.blocoClicado=null
  }

  toggleSemanaDestino(){
    this.exibeSemanaDestino=!this.exibeSemanaDestino
    this.selectedDiaDestinoDaSemana=null
    this.emProcessoDeUpdate=false
    this.selectVideoForm.get('semanaDestinoFormControl').setValue("")
  }

  replicaListaDaSemana(){
    this.blocoClicado=null
    if(this.selectedDiaDestinoDaSemana){
      this.listaCanal[this.selectedDiaDestinoDaSemana]=[]
      let listaOrigem:Bloco[] = this.listaCanal[this.selectedDiaDaSemana] 
      this.listaIdsProgramaMontado = [...new Set(listaOrigem.map(prog=>prog.idProgMontado))]
      this.listaIdsProgramaMontado.reverse()
      this.selectVideoForm.get('semanaFormControl').setValue(this.selectedDiaDestinoDaSemana)
      this.programasReplicadosCount = this.listaIdsProgramaMontado.length-1
      let programToSelect:string = listaOrigem
                            .find((bloco:Bloco)=>bloco.idProgMontado==
                            this.listaIdsProgramaMontado[this.programasReplicadosCount]&&
                            bloco.tipo!=="intervalos").atracao
      this.selectVideoForm.get('programaDeTvFormControl').setValue(programToSelect)
      this.adicionarPrograma()
    }
  }
 
  updateListaDaSemana(){
    this.emProcessoDeUpdate=true
    this.blocoClicado=null
    this.listaParaUpdate=[]
    let listaOrigem:Bloco[] = this.listaCanal[this.selectedDiaDaSemana] 
    this.listaIdsProgramaMontado = [...new Set(listaOrigem.map(prog=>prog.idProgMontado))].filter(prog=>prog)
    this.listaIdsProgramaMontado.reverse()
    this.programasReplicadosCount = this.listaIdsProgramaMontado.length-1
    console.log("updateListaDaSemana")
    console.log("listaOrigem",listaOrigem)
    console.log("this.listaIdsProgramaMontado",this.listaIdsProgramaMontado)
    console.log("this.programasReplicadosCount",this.programasReplicadosCount)
    let programToSelect = listaOrigem
                          .find(prog=>prog.idProgMontado==
                          this.listaIdsProgramaMontado[this.programasReplicadosCount]&&
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
        let listaDiaReduzida = [...new Set(listaOriginal.map(prog=>prog.idProgMontado))]

        let listaAnexosBloco = listaDiaReduzida.map((progId:any)=>{
          let obj:any = {}
          let progInfo = listaOriginal.find(prog=>prog.idProgMontado==progId&&prog.tipo!=="intervalos")
          if(progInfo&&progInfo.atracao){
            obj.atracao = progInfo.atracao
            obj.idProgMontado = progInfo.idProgMontado
          }
          let blocos = listaOriginal.filter(prog2=>prog2.idProgMontado==progId)
          
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

        this.canal = this.canais[indexOfCanal][this.listaDeNomesDosDiasDaSemana[this.selectedDiaDaSemana]]
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
// MAS...  esse nome náo faz sentido, porque dá a ideia de que existe uma lista associada a um canal,
// quando na verdade existe um OBJETO associado a um canal. E esse objeto do tipo Canal, tem propeiedades
// com nomes de dias da semana. Entao se a gente falar DIA, sempre vai ser um DIA associado a uma propriedade
// de Canais. Entao, se a gente chamar blocosDiaDaSemana, vai ficar claro que é uma lista de blocos associada a 
// um dia da semana que é uma propriedade de um canal. Entáo vamos chamar de blocosDiaDaSemana

// novablocosDiaDaSemana: essa é a lista blocosDiaDaSemana recalculada apos um bloco ser adicionado ou removido.