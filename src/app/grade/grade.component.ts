import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { CommonService } from 'src/services/common.service';
import { Subject } from 'rxjs';
import { MongodbService } from '../services/mongodb.service';

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
  blocosAmount:number;
  programasBlocosCount:number;
  programasPorBloco:Object;

  spyListaAdicionada: Subject<any>;
  spyListaReplicada: Subject<any>;

  getInfoClicado:boolean;
  getInfoBlocoClicado:boolean;
  getInfoFromBlocoClicado:boolean;


  constructor(private commonServices: CommonService,
              private mongodbService: MongodbService,
              private formBuilder: FormBuilder) { 
                this.selectVideoForm = this.formBuilder.group({
                  semanaFormControl:[""],
                  semanaDestinoFormControl:[""],
                  canaisFormControl:[""],
                  tipoDeVideoFormControl:[""],
                  programaDeTvFormControl:[""]
                })
               }
  programaClicado:any;
  programaBlocoSelectionado:any;
  selectVideoForm :any
  novoPrograma:FormControl
  duracaoEstimada:FormControl

  semana:Array<String>=["segunda","terca","quarta","quinta","sexta","sabado","domingo"]
  semanaSemBlocos:Array<String>=["segunda","terca","quarta","quinta","sexta","sabado","domingo"]

  horas:any = []
  canais: Array<any>

  ngOnInit(): void {

    

    this.exibeSemanaDestino=false
    this.spyListaAdicionada = new Subject()
    this.spyListaAdicionada.subscribe((info)=>{
      if(this.intervalosCount){
        this.addIntervalo((info.intAmount+2),info.intervaloApi)
      } else if(this.programasBlocosCount){
        this.addBlocos(info.blocoApi)
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
      this.canais=data.sort(this.commonServices.sortPor("canal"))
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
                    .filter(prog=>!prog.tituloAtracao
                    .includes(this.programaBlocoSelectionado.tituloAtracao))

      this.recalculaHorariosDeExibicao(newList)

      let newListBloco = this.listaSemana[this.selectedDiaDaSemana+'Bloco']
                    .filter(prog=>!prog.tituloAtracao
                    .includes(this.programaBlocoSelectionado.tituloAtracao))
      
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

    let indexFinalAdicionados=ind56666666666666666666666666exInicioAdicionados+listaAdicionados.length-2
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
    console.log("listaFinal 2 415",listaFinal)

      this.recalculaHorariosDeExibicao(listaFinal) 
  }

  organizaProgramasBlocos(){
    let listaParaORganizar = this.emProcessoDeUpdate? this.listaParaUpdate : this.listaSemana[this.selectedDiaDaSemana]
    
    let indexToAdd=listaParaORganizar.find(prog=>prog.idProgTotal==this.idProgTotal).indice

    let listaSemAdicionados=listaParaORganizar.filter(prog=>prog.idProgTotal!=this.idProgTotal)
    let listaAdicionados=listaParaORganizar.filter(prog=>prog.idProgTotal==this.idProgTotal)
    let listaPre=listaSemAdicionados.slice(0,indexToAdd)
    let listaPos=listaSemAdicionados.slice(indexToAdd,listaSemAdicionados.length)
    console.log("listaParaORganizar",listaParaORganizar)
    console.log("listaPre",listaPre)
    console.log("listaAdicionados",listaAdicionados)
    console.log("listaPos",listaPos)
    console.log("programasPorBloco",this.programasPorBloco)
    console.log("blocosAmount",this.blocosAmount)
    let listaFinal=[...listaPre,...listaAdicionados,...listaPos]
    console.log("listaFinal",listaFinal)
    this.listaBlocos=[]

      this.recalculaHorariosDeExibicao(listaFinal) 
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
            this.commonServices.toTime(progAnterior.duracaoTotalDaAtracaoEmSegundos
            +this.commonServices.toSeconds(progAnterior.horarioDeExibicao))
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
        this.organizaIntervalos()
      } else if(this.programasBlocosCount){
          let blocoInfo={}
          blocoInfo['blocoApi']=this.listaBlocos[this.programasBlocosCount-1]
          this.spyListaAdicionada.next(blocoInfo)
      } else if(!this.programasBlocosCount&&this.listaBlocos.length>0){
        this.organizaProgramasBlocos()
      } else if(newList.length==this.lengthListaFinal&&this.prePosAvailable){
        if(this.prePosCount>0){
          let prePosInfo = {}
          prePosInfo['intAmount'] = this.prePosCount
          prePosInfo['prePosApi'] = this.prePosApi
          this.spyListaAdicionada.next(prePosInfo)
        } else {
          this.organizaPrePos()
        }
      }

    }

  }

  updateOnMongoDB(video,type):void {
    this.mongodbService.updateVideo(video._id,video).subscribe(() => {
      console.log('Video updated successfully!');
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

  addBlocos(blocosInfo){
    this.lengthListaFinal++
    let listaAtual = this.emProcessoDeUpdate ? this.listaParaUpdate:
                     this.listaSemana[this.selectedDiaDaSemana]
    let indexToSelect = listaAtual.indexOf(listaAtual.find(prog=>prog.idProgTotal==this.idProgTotal))
    let info = listaAtual[indexToSelect]
    this.clickAtracao(info,this.selectedDiaDaSemana,indexToSelect)
    this.selectVideoForm.get('programaDeTvFormControl').setValue(blocosInfo)
    this.adicionarPrograma()
    this.programasBlocosCount--
  }

  adicionarPrograma(): void {
    // CHECK IF DIA DA SEMANA AND PROGRAMA DE TV ARE SELECTED
    if(this.selectedDiaDaSemana&&this.selectedProgramaDeTv){
    // GET UNSUBSCRIBABLE LIST OF PROGRAMS ACCORDING TO SELECTED PROGRAMA DE TV

    if(this.selectedProgramaDeTv.anexos&&this.selectedProgramaDeTv.anexos.blocosAmount
      &&this.listaBlocos.length==0){
      this.programasPorBloco={}
      this.blocosAmount=this.selectedProgramaDeTv.anexos.blocosAmount
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

    
    let unsubscribe=
    this.mongodbService.getProgramasDeTv(this.selectedProgramaDeTv.tipo,this.selectedProgramaDeTv.value)
    .subscribe((data:any ) => {
      let videoAdicionado

      let listaDeProgramas = data

      //GET EACH REF ON THE LISTA DE PROGRAMAS AND CREATE A NEW LIST WITH THE PROGRAMAS DATA

      const montaLista = ()=>{

        //FILTER 
        let listaFiltrada = listaDeProgramas.filter(video=>video.order&&!video.added)
          .sort(this.commonServices.sortPor("order"))
          
          if(listaFiltrada.length>0){

                    let prog:any = this.selectedProgramaDeTv
                    
                    if(!this.prePosAvailable&&prog.anexos&&prog.anexos.prePos){
                      this.prePosApi=prog.anexos.prePos
                      this.prePosAvailable=true
                      this.prePosCount=2
                    }

                    videoAdicionado = listaFiltrada[0]
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
                      unsubscribe.unsubscribe()
                      this.recalculaHorariosDeExibicao(newList)
          } else {
            this.resetAddedLista(listaDeProgramas, "A")
            unsubscribe.unsubscribe()
          }

      }
      montaLista()
    });

    } else if(!this.selectedDiaDaSemana){
      this.alerta="Informe o dia da semana"
    } else if(!this.programaClicado){
      this.alerta="Selecione programa a ser deletado"
    }
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
        this.adicionarPrograma()
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
      this.programaDeTvFiltered=this.programaDeTv=data.sort(this.commonServices.sortPorTitulo())
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
          } else {
            console.log("dia",dia)
            console.log("listaOriginal",listaOriginal)
            console.log("progId",progId)
            console.log("progInfo",progInfo)
          }
          let blocos = listaOriginal.filter(prog2=>prog2.idProgTotal==progId)
          
          obj.horarioDeExibicao = blocos[0].horarioDeExibicao
          obj.blocos = blocos
          if(blocos.filter(lista=>lista.tipo!="intervalos").length>0){
            obj.arquivo = progInfo.titulo
            obj.tituloAtracao = progInfo.tituloAtracao
          }
          obj.tempoTotalEmSegundos = blocos.map(lista=>lista.duracaoTotalDaAtracaoEmSegundos).reduce((a,b)=>{return a+b})
          obj.tempoTotal = this.commonServices.toTime(obj.tempoTotalEmSegundos)
          return obj
        })
        this.canais[indCanal][dia+"Bloco"]=listaBlocos}
      })

        this.listaSemana=this.canais[indCanal]
        let semanaBloco = this.semana.map(dia=>dia+"Bloco")
        this.semana = [...this.semana,...semanaBloco]
  }

  
}
