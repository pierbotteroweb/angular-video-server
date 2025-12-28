import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EMPTY, Subject, Subscription } from 'rxjs';
import { MongodbService } from '../services/mongodb.service';
import { FirebaseService } from '../services/firebase.service';
import { sts } from 'shuffle-tv-services/lib'
import { Arquivo, Bloco, ProgramaMontado, Canal, DiaDaSemana, DiaDaSemanaProgramaMontado, Emissora, InfoIntPrePos, ListaParaDesuso, Programa, ProgramasPorBloco, TipoDePrograma } from './types/types';
import { concatMap, take, takeUntil } from 'rxjs/operators';
import { GradeService } from '../services/grade.service';
import { DIAS_DA_SEMANA } from './grade.constants';
import { GradeDataService } from '../services/grade-data.service';

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.scss']
})
export class GradeComponent implements OnInit {
  programaDeTv: Programa[];
  selectedProgramaDeTvBlocos: Programa;
  selectedCanal: Emissora = "Globo";
  selectedDiaDestinoDaSemana: DiaDaSemana;


  // listaCanal: Canal = {} as Canal;
  listaIdsProgramaMontado: Array<string>;

  alerta:String;
  exibeSemanaDestino:boolean = false;
  
  blocosEmProcessamento = false
  organizandoPrePos = false

  programasReplicadosCount:number;

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

  constructor(private firebaseService: FirebaseService,
              private mongodbService: MongodbService,
              private gradeService: GradeService,
              public gd: GradeDataService,
              private formBuilder: FormBuilder) {
                this.selectVideoForm = this.formBuilder.group({
                  semanaFormControl:[""],
                  semanaDestinoFormControl:[""],
                  canaisFormControl:[""],
                  mimeTypeFormControl:[""],
                  programaDeTvFormControl:[""]
                })
               }
  programaMontadoSelectionado:ProgramaMontado | null = null;
  selectVideoForm :FormGroup
  novoPrograma:FormControl
  duracaoEstimada:FormControl
  listaDeNomesDosDiasDaSemana:Array<DiaDaSemanaProgramaMontado>
  listaDeNomesDosDiasDaSemanaSemProgramaMontado:Array<DiaDaSemana> = DIAS_DA_SEMANA
  horas:string[] = []
  canais:any
  destroy$ = new Subject();


  ngOnInit(): void {
    this.populateListasDeDiasDaSemana()

    this.initiateSpyListaAdicionada()

    this.initiateSpyListaReplicada()

    this.getCanaisFromMongoDB()

    this.handleFomrsControlValueChanges()

    this.initiateCanalSelectionFlow()

    this.setHorasOrder()

  }

  populateListasDeDiasDaSemana():void{
    this.listaDeNomesDosDiasDaSemana = 
    this.gradeService.populateListasDeDiasDaSemana
    (this.listaDeNomesDosDiasDaSemanaSemProgramaMontado)
  }

  initiateSpyListaAdicionada():void{
    this.spyListaAdicionada = new Subject()
    this.spyListaAdicionada.pipe(takeUntil(this.destroy$))
    .subscribe((info:InfoIntPrePos)=>{
      if(this.gd.getIntervalosCount()){
        setTimeout(()=>{
          this.addIntervalo((info.intAmount+2),info.intervaloApi)
        },500)
      } else if(this.gd.getPrePosCount()){
        this.addPrePos(info.prePosApi)
      }
    })
  }

  initiateSpyListaReplicada():void{    
    this.spyListaReplicada = new Subject()
    this.spyListaReplicada.pipe(takeUntil(this.destroy$))
    .subscribe((programaDeTvValue)=>{
      if(this.programasReplicadosCount>=0){
        this.selectVideoForm.get('programaDeTvFormControl').setValue(programaDeTvValue)
        this.adicionarPrograma()
      }
    })

  }

  setHorasOrder():void{

    for(let hora=6;hora<24;hora++){
      this.horas.push(`${hora}:00`)
    }

    for(let hora=0;hora<6;hora++){
      this.horas.push(`${hora}:00`)
    }    

  }

  initiateCanalSelectionFlow(){
    
    this.gd.listaDeProgramasDoCanal$
    .pipe(takeUntil(this.destroy$))
    .subscribe(lista=> this.programaDeTv = lista)
  }

  handleFomrsControlValueChanges():void{
    
    this.selectVideoForm.get('semanaDestinoFormControl')
    .valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(value=>{
      this.alerta=""
      this.selectedDiaDestinoDaSemana=value
    })

    this.selectVideoForm.get('semanaFormControl')
    .valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe((value:DiaDaSemana)=>{
      this.alerta=""
      this.gd.setSelectedDiaDaSemana(value)
    })


    this.selectVideoForm.get('canaisFormControl')
    .valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(value=>{
      this.alerta=""
      let canalFound:Canal = this.canais.find(canal=>canal._id==value)
      if(!canalFound){
        return 
      }
      this.selectedCanal=canalFound.emissora
      this.gradeService.getListaDeProgramasDeTvFromMongodb(this.selectedCanal)
      this.getLista()
    })

    this.selectVideoForm.get('programaDeTvFormControl')
    .valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(value=>{
      this.alerta=""
      this.gd.setSelectedProgramaDeTv(this.programaDeTv.filter(prog=>prog.value==value)[0])
    })

  }

  getCanaisFromMongoDB(){
    this.mongodbService.getCanais()
    .pipe(take(1))    
    .subscribe((canais:Canal[] )=>{ 
      this.canais = canais.sort(sts.sortPor("canal"))
      this.displaySelectedCanalInfo()
      this.canais.map(canal=>{
        this.gerarListasDeProgramasMontados(canal.emissora)
      })
    })
  }
  
  removePrograma(){

    let listaCanalDoDiaDaSemana:Bloco[] = this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()]

    if(this.gd.getSelectedDiaDaSemana()&&this.gd.getBlocoClicado()){
      let indexToRemove = this.gd.getBlocoClicado().indice+1
      let blocoSendoRemovido:Bloco = this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()][this.gd.getBlocoClicado().indice]
      this.alerta="Item Removido"
      setTimeout(()=>{this.alerta=""},1000)
      blocoSendoRemovido.added=false
      this.gradeService.updateArquivoOnMongoDB(blocoSendoRemovido)

      if(listaCanalDoDiaDaSemana.length>1){
        let novaListaCanal:Bloco[] = [...listaCanalDoDiaDaSemana.slice(0,indexToRemove-1),
                       ...listaCanalDoDiaDaSemana.slice(indexToRemove)] 
        this.recalculaHorariosDeExibicao(novaListaCanal)
      }else{
        this.gd.setListaCanal([])
      }

    } else if(this.programaMontadoSelectionado){

      this.programaMontadoSelectionado.blocos.map((arquivo:Bloco)=>{
        arquivo.added=false
        this.gradeService.updateArquivoOnMongoDB(arquivo)
      })
      
      let novaListaCanal = listaCanalDoDiaDaSemana
                    .filter(prog=>prog.idProgMontado!==this.programaMontadoSelectionado.blocos[0].idProgMontado)

      this.recalculaHorariosDeExibicao(novaListaCanal)

      let novaListaCanalProgramaMontado = this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()+'ProgramaMontado']
                    .filter(prog=>prog.idProgMontado!==this.programaMontadoSelectionado.blocos[0].idProgMontado)

      let listaCanal = this.gd.getListaCanal()
      
      listaCanal[this.gd.getSelectedDiaDaSemana()+'ProgramaMontado'] = novaListaCanalProgramaMontado

      this.gd.setListaCanal(listaCanal)


    } else if(!this.gd.getBlocoClicado()){
      this.alerta="Selecione programa a ser deletado"
    } else if(!this.gd.getSelectedDiaDaSemana()){
      this.alerta="Informe o dia da semana"
    }
  }

  organizaIntervalos(){
    let listaParaORganizar:Bloco[] = this.gd.getEmProcessoDeUpdate() ? this.gd.getListaParaUpdate() : this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()]
    let lengthListaParaOrganizar = listaParaORganizar.length
    
    let indexInicioAdicionados=listaParaORganizar.find(prog=>prog.idProgMontado==this.gd.getIdProgMontado()).indice

    let indexFinalAdicionados=listaParaORganizar.reverse().find(prog=>prog.idProgMontado==this.gd.getIdProgMontado()).indice

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
      this.gd.setQtdeIntervalos(0)
      this.gd.setIntervalosCount(0)

      this.recalculaHorariosDeExibicao(listaFinal) 
    })
  }

  organizaPrePos(){
    if(this.organizandoPrePos){
      return; // Prevent infinite recursion
    }
    
    this.organizandoPrePos = true;
    
    let listaParaORganizar = this.gd.getEmProcessoDeUpdate()? this.gd.getListaParaUpdate() : this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()]
    let lengthListaParaOrganizar = listaParaORganizar.length
    
    let indexInicioAdicionados=listaParaORganizar.indexOf(listaParaORganizar.find(prog=>prog.idProgMontado==this.gd.getIdProgMontado()))
        
    let listaAdicionados = listaParaORganizar.filter(prog=>prog.idProgMontado==this.gd.getIdProgMontado())

    let indexFinalAdicionados=indexInicioAdicionados+listaAdicionados.length-2
    let listaPreAdicionados = listaParaORganizar.slice(0,indexInicioAdicionados)
    
    let listaAadicionadosPrograma = listaAdicionados.filter(prog=>!prog.atracao.includes("prePos"))
    let listaAadicionadosPrepos = listaAdicionados.filter(prog=>prog.atracao.includes("prePos"))
    let listaPosAdicionados = listaParaORganizar.slice(indexFinalAdicionados+1,lengthListaParaOrganizar).filter(prog=>prog.idProgMontado!=this.gd.getIdProgMontado())

    let listaFinal = [...listaPreAdicionados,
                     listaAadicionadosPrepos[0],
                      ...listaAadicionadosPrograma,
                      listaAadicionadosPrepos[1],
                      ...listaPosAdicionados]
                      
    this.gd.setPrePosCount(0)
    this.gd.setBlocoClicado(null)

    this.recalculaHorariosDeExibicao(listaFinal)
    
    this.organizandoPrePos = false;
  }

  organizaProgramasBlocos(){

    let listaParaORganizar = this.gd.getEmProcessoDeUpdate()? this.gd.getListaParaUpdate() : this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()]

    let indexAdicionadosInicio = listaParaORganizar.indexOf(listaParaORganizar.find(prog=>prog.idProgMontado==this.gd.getIdProgMontado()))

    let listaPreAdicionados = listaParaORganizar.slice(0,indexAdicionadosInicio)

    let listaAdicionados=listaParaORganizar.filter(prog=>prog.idProgMontado==this.gd.getIdProgMontado())

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
    this.selectedDiaDestinoDaSemana:this.gd.getSelectedDiaDaSemana()

    novaListaCanal[0]['horarioDeExibicao']="06:30:00"
    
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

    if(this.gd.getEmProcessoDeUpdate()){
      this.gd.setListaParaUpdate(novaListaCanal)
    } else {

      let listaCanal = this.gd.getListaCanal()

      listaCanal[diaDaSemana]=novaListaCanal

      this.gd.setListaCanal(listaCanal)

    }

    if(this.gd.getSelectedProgramaDeTv()){
      let selectedProgramaDeTv:Programa = this.gd.getSelectedProgramaDeTv()
    
      let intervaloApi:string
  
      if(selectedProgramaDeTv.tipo=="intervalos"&&selectedProgramaDeTv.prePos==false){
        intervaloApi = selectedProgramaDeTv.value
      } else if(selectedProgramaDeTv.anexos&&selectedProgramaDeTv.anexos.intervalo){
        intervaloApi = selectedProgramaDeTv.anexos.intervalo
      }
  
      if(this.gd.getIntervalosCount()){
        let intInfo:InfoIntPrePos = {
          intAmount: this.gd.getIntervalosCount(),
          intervaloApi: intervaloApi
        }
  
        this.spyListaAdicionada.next(intInfo)
      } else if(this.gd.getQtdeIntervalos()){
        this.lengthListaFinal = novaListaCanal.length
        if(!this.gd.getPrePosAvailable()){
          this.selectVideoForm.get('programaDeTvFormControl')
          .setValue(sts.lowerCaseFirstChar(selectedProgramaDeTv.value.replace("int","")))
        }
        this.organizaIntervalos()
      } else if(novaListaCanal.length==this.lengthListaFinal&&this.gd.getPrePosAvailable()){
        if(this.gd.getPrePosCount()>0){
          let prePosInfo:InfoIntPrePos = {
          intAmount: this.gd.getPrePosCount(),
          prePosApi: this.gd.getPrePosApi()
        }
          this.spyListaAdicionada.next(prePosInfo)
        } else if(!this.organizandoPrePos) {
          this.selectVideoForm.get('programaDeTvFormControl')
          .setValue(sts.lowerCaseFirstChar(selectedProgramaDeTv.value.replace("prePos","")))
          this.organizaPrePos()
        }
      }
      
      // Verificar se precisa adicionar blocos (independente do bloco de prePos)
      if(selectedProgramaDeTv.tipo!="intervalos"){
        if(this.programasBlocosCount && !this.blocosEmProcessamento){
          this.blocosEmProcessamento = true
          this.addBlocosFromMongoDB()
        }
      }

    }

  }

  updateCanaisOnMongoDB(canal:Canal):void {

    this.mongodbService.updateCanais(canal)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      let listOfTypes = 
      [...new Set(this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()]
      .map((bloco:Bloco)=>bloco.tipo))]

      listOfTypes.forEach((tipo:TipoDePrograma)=>{
        let idsDeArquivosDoMesmoTipo = [...new Set(this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()]
        .filter((bloco:Bloco)=>bloco.tipo == tipo).map((bloco:Bloco)=>bloco.id))]

        this.mongodbService
        .updateMany(idsDeArquivosDoMesmoTipo, { emUso: true }, tipo)
        .pipe(
          concatMap(() => {
      
            if (this.gd.getListaParaDesuso()[tipo].length===0) {
              return EMPTY;
            }

            return this.mongodbService.updateMany(
              this.gd.getListaParaDesuso()[tipo],
              { emUso: false },
              tipo
            );
          })
        )
        .pipe(takeUntil(this.destroy$))
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
    let listaAtual = this.gd.getEmProcessoDeUpdate() ? this.gd.getListaParaUpdate():
                     this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()]
    let info = listaAtual[this.gd.getIndexToAdd()]
    this.clickBloco(info,this.gd.getSelectedDiaDaSemana(),this.gd.getIndexToAdd())
    this.selectVideoForm.get('programaDeTvFormControl').setValue(intApi)
    this.adicionarPrograma()
    this.gd.decreaseIntervalosCount()
  }

  addPrePos(prePosApi){
    this.lengthListaFinal++

    let listaAtual = this.gd.getEmProcessoDeUpdate() ? this.gd.getListaParaUpdate():
                     this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()]
    let indexToSelect = listaAtual.indexOf(listaAtual.find(prog=>prog.idProgMontado==this.gd.getIdProgMontado()))
    let bloco:Bloco = listaAtual[indexToSelect]
    this.clickBloco(bloco,this.gd.getSelectedDiaDaSemana(),indexToSelect)
    this.selectVideoForm.get('programaDeTvFormControl').setValue(prePosApi)
    this.adicionarPrograma()
    this.gd.decreasePrePosCount()
  }

  adicionarPrograma(): void {
    let selectedProgramaDeTv: Programa = this.gd.getSelectedProgramaDeTv()

    if(!this.gd.getSelectedDiaDaSemana() || !this.gd.getSelectedProgramaDeTv()){
      this.alerta="Informe o dia da semana e programa a ser adicionado"
      return
    }

    if(selectedProgramaDeTv.anexos?.blocosAmount&&this.listaAnexosBloco.length==0){
      this.programasPorBloco={}
      this.blocosAmount=selectedProgramaDeTv.anexos.blocosAmount
      this.selectedProgramaDeTvBlocos=selectedProgramaDeTv
      for(let i=0;i<this.blocosAmount;i++){
        selectedProgramaDeTv.anexos["bloco"+(i+1)].map((valueProgramaBloco:string,index)=>{
          this.listaAnexosBloco.push(valueProgramaBloco)
          this.programasPorBloco["bloco"+(i+1)]=index+1
        })
      }
      this.programasBlocosCount=this.listaAnexosBloco.length
    }

    if(selectedProgramaDeTv.tipo!=="intervalos"
     &&!this.listaAnexosBloco.includes(selectedProgramaDeTv.value)){
      this.gd.setIdProgMontado(selectedProgramaDeTv.value+new Date().valueOf())
    }

    this.mongodbService.getProgramasDeTv(selectedProgramaDeTv.tipo,selectedProgramaDeTv.value)
    .pipe(takeUntil(this.destroy$))
    .subscribe((listaDeProgramas:any ) => {

      //GET EACH REF ON THE LISTA DE PROGRAMAS AND CREATE A NEW LIST WITH THE PROGRAMAS DATA
      this.montaLista(listaDeProgramas)
    });

     if(!this.gd.getBlocoClicado()){
      this.alerta="Selecione programa a ser deletado"
    }
  }
  
  montaLista = (listaDeProgramas)=>{

    let listaDeProgramasFiltrada = listaDeProgramas.filter(video=>video.order&&!video.added)
      .sort(sts.sortPor("order"))


    if(listaDeProgramasFiltrada.length>0){
      this.recalculaHorariosDeExibicao(
        this.gradeService.montaLista(listaDeProgramasFiltrada)
      )
    } else {
      this.resetAddedLista(listaDeProgramas, "programa")
    }
  }

  adicionarProgramaBloco(blocoId): void {
    
    this.mongodbService.getProgramasDeTv("dublado",blocoId)
    .pipe(takeUntil(this.destroy$))
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
                        "idProgMontado":this.gd.getIdProgMontado(),
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
                      this.gradeService.updateArquivoOnMongoDB(arquivoSendoAdicionado)
                      this.listaProgramasBlocos.push(novoBloco)
      }
      montaLista()
    });
  }

  replicaNext(){
    this.gd.setBlocoClicado(null)

    if(this.programasReplicadosCount==0&&this.gd.getEmProcessoDeUpdate()){
      
      this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()] = this.gd.getListaParaUpdate()
      this.gd.setListaParaUpdate([])
      this.gd.setEmProcessoDeUpdate(false)
    } else {

      this.programasReplicadosCount--
      let programaParaReplicar = this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()]
                            .find((bloco:Bloco)=>bloco.idProgMontado==
                            this.listaIdsProgramaMontado[this.programasReplicadosCount]&&
                            bloco.tipo!=="intervalos").atracao
  
      this.spyListaReplicada.next(programaParaReplicar)
    }
  }

  resetAddedLista(lista,type){
    const functionThatReturnsAPromise = video => {
      
      video.added=false
      this.gradeService.updateArquivoOnMongoDB(video)
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
        // Adicionar intervalos entre os blocos se houver intervalo definido nos anexos
        if(this.selectedProgramaDeTvBlocos.anexos?.intervalo){
          this.adicionarIntervalosEntreBlocos()
        } else {
          this.finalizarOrganizacaoBlocos()
        }
    }) 
  }

  adicionarIntervalosEntreBlocos(){
    let intervaloApi = this.selectedProgramaDeTvBlocos.anexos.intervalo
    
    // Buscar os dados do intervalo
    this.mongodbService.getProgramasDeTv("intervalos", intervaloApi)
    .pipe(takeUntil(this.destroy$))
    .subscribe((listaDeIntervalos:any) => {
      if(listaDeIntervalos && listaDeIntervalos.length > 0){
        let listaAtual = this.gd.getEmProcessoDeUpdate() ? this.gd.getListaParaUpdate():
                         this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()]
        
        // Encontrar todos os blocos adicionados (sem intervalos)
        let blocosAdicionados = listaAtual.filter(prog=>prog.idProgMontado==this.gd.getIdProgMontado() && prog.tipo!=="intervalos")
        
        if(blocosAdicionados.length === 0){
          this.finalizarOrganizacaoBlocos()
          return
        }
        
        // Filtrar intervalos disponíveis
        let intervalosDisponiveis = listaDeIntervalos.filter(int=>int.order&&!int.added).sort(sts.sortPor("order"))
        if(intervalosDisponiveis.length === 0){
          intervalosDisponiveis = listaDeIntervalos
        }
        
        // Adicionar intervalos entre os blocos (um intervalo após cada bloco, exceto o último)
        let novaLista:Bloco[] = []
        let indiceIntervaloDisponivel = 0
        
        listaAtual.forEach((item) => {
          novaLista.push(item)
          
          // Se este item é um bloco do programa montado (não é intervalo), adicionar intervalo após ele
          if(item.idProgMontado === this.gd.getIdProgMontado() && item.tipo !== "intervalos"){
            let indiceNoArray = blocosAdicionados.indexOf(item)
            // Adicionar intervalo após cada bloco, exceto o último
            if(indiceNoArray >= 0 && indiceNoArray < blocosAdicionados.length - 1){
              let intervaloData = intervalosDisponiveis[indiceIntervaloDisponivel % intervalosDisponiveis.length]
              
              let novoIntervalo:Bloco = {
                "atracao": intervaloApi,
                "tituloAtracao": intervaloData.tituloAtracao || intervaloApi,
                "titulo": intervaloData.titulo || intervaloApi,
                "volume": intervaloData.volume || 1,
                "horarioDeExibicao": "",
                "duracaoTotalDaAtracaoEmSegundos": intervaloData.duracao || 0,
                "id": intervaloData._id,
                "idProgMontado": this.gd.getIdProgMontado(),
                "tipo": "intervalos"
              }
              
              novaLista.push(novoIntervalo)
              
              // Marcar intervalo como adicionado
              intervaloData.added = true
              this.gradeService.updateArquivoOnMongoDB(intervaloData)
              
              indiceIntervaloDisponivel++
            }
          }
        })
        
        // Atualizar a lista
        if(this.gd.getEmProcessoDeUpdate()){
          this.gd.setListaParaUpdate(novaLista)
        } else {
          let listaCanal = this.gd.getListaCanal()
          listaCanal[this.gd.getSelectedDiaDaSemana()] = novaLista
          this.gd.setListaCanal(listaCanal)
        }
      }
      
      this.finalizarOrganizacaoBlocos()
    })
  }

  finalizarOrganizacaoBlocos(){
    this.programasBlocosCount=0
    this.blocosEmProcessamento = false
    this.listaAnexosBloco=[]
    this.organizaProgramasBlocos()
  }

  subirLista(){
    let canal:Canal =  this.canais.find((canal:Canal)=>canal.emissora==this.selectedCanal)
    this.updateCanaisOnMongoDB(canal)
  }

  getLista(){
      let listaCanal = this.canais.find(canal=>canal.emissora==this.selectedCanal)
      if (!listaCanal) return;
      this.gd.setListaCanal(listaCanal)
  }

  getStyle(width,dia,index?){
    if(this.gd.getBlocoClicado()&&(this.gd.getBlocoClicado().indice==index)&&(this.gd.getBlocoClicado().dia==dia)){
      return `width:${width/10}px;background:blue`
    } else {      
      return `width:${width/10}px`
    }
  }

  blocoIsSelected(dia,index?){
    return this.gd.getBlocoClicado()&&(this.gd.getBlocoClicado().indice==index)&&(this.gd.getBlocoClicado().dia==dia)
  }

  programaMontadoIsSelected(dia,index?){
    return this.programaMontadoSelectionado&&
      (this.programaMontadoSelectionado.indice==index)&&
      (this.programaMontadoSelectionado.dia==dia)
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

  getInfoProgramaMontado(info:ProgramaMontado,dia:DiaDaSemana,index:number){

    this.getInfoClicado=false
    this.getInfoProgramaMontadoClicado=true
    this.getInfoFromProgramaMontadoClicado=false
    this.alerta=""
    this.gd.setBlocoClicado(null)
    if(this.programaMontadoSelectionado==info){
      this.programaMontadoSelectionado=null
    }else{
      info.indice=index
      info.dia=dia
      this.programaMontadoSelectionado = info      
      this.gd.setSelectedDiaDaSemana(dia)
    }
  }

  clickBloco(bloco:Bloco,diaDaSemana:DiaDaSemana,index:number){
    this.getInfoClicado=true
    this.getInfoProgramaMontadoClicado=false
    this.getInfoFromProgramaMontadoClicado=false
    this.alerta=""
    this.programaMontadoSelectionado=null
    if(this.gd.getBlocoClicado()==bloco){
      this.gd.setBlocoClicado(null)
    }else{
      bloco.indice=index
      bloco.dia=diaDaSemana
      this.gd.setBlocoClicado(bloco)
      this.selectVideoForm.get('semanaFormControl').setValue(diaDaSemana)     
      this.gd.setSelectedDiaDaSemana(diaDaSemana)
    }
  }

  clickBlocoFromProgramaMontado (bloco:Bloco){

    this.getInfoFromProgramaMontadoClicado=true
    this.gd.setBlocoClicado(bloco)

  }

  toggleSemanaDestino(){
    this.exibeSemanaDestino=!this.exibeSemanaDestino
    this.selectedDiaDestinoDaSemana=null
    this.gd.setEmProcessoDeUpdate(false)
    this.selectVideoForm.get('semanaDestinoFormControl').setValue("")
  }

  replicaListaDaSemana(){
    this.gd.setBlocoClicado(null)
    if(this.selectedDiaDestinoDaSemana){
      this.gd.getListaCanal()[this.selectedDiaDestinoDaSemana]=[]
      let listaOrigem:Bloco[] = this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()] 
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
    this.gd.setEmProcessoDeUpdate(true)
    this.gd.setBlocoClicado(null)
    this.gd.setListaParaUpdate([])
    let listaOrigem:Bloco[] = this.gd.getListaCanal()[this.gd.getSelectedDiaDaSemana()] 
    this.listaIdsProgramaMontado = [...new Set(listaOrigem.map(prog=>prog.idProgMontado))].filter(prog=>prog)
    this.listaIdsProgramaMontado.reverse()
    this.programasReplicadosCount = this.listaIdsProgramaMontado.length-1
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

        let listaCanal = this.canais[indexOfCanal][this.listaDeNomesDosDiasDaSemana[this.gd.getSelectedDiaDaSemana()]]
        this.gd.setListaCanal(listaCanal)
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
    let selectedCanal = this.canais.find(canalMapeado=>canalMapeado.canal==canal)
    this.setCanaisForm(selectedCanal._id)
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
    // this.selectVideoForm.get('semanaFormControl').value
    // this.canais

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

  ngOnDestroy(){
    this.destroy$.next()
    this.destroy$.complete()
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