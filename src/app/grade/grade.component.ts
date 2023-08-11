import { Component, OnInit } from '@angular/core';
// import { FirebaseService } from '../services/firebase.service';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormControl } from '@angular/forms';
import { CommonService } from 'src/services/common.service';
import { UploadVideoService } from '../services/upload-video.service';
import { ThisReceiver } from '@angular/compiler';
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
  listaDeBlocos: Object;

  alerta:String;
  exibeSemanaDestino:boolean;
  emProcessoDeUpdate:boolean;

  intervalosCount:number;
  prePosCount:number;
  prePosAvailable:boolean;
  programasReplicadosCount:number;

  qtdeIntervalos:number;
  indexToAdd:number;
  lengthListaFinal:number;

  spyListaAdicionada: Subject<any>;
  spyListaReplicada: Subject<any>;

  getInfoClicado:boolean;
  getInfoBlocoClicado:boolean;
  getInfoFromBlocoClicado:boolean;


  constructor(private commonServices: CommonService,
              // private firebaseService: FirebaseService,
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
  programaSelectionado:any;
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
    this.spyListaAdicionada.subscribe((data)=>{
      if(this.intervalosCount){
        this.addIntervalo((data.intAmount+2),data.intervaloApi)
      } else if(this.prePosCount){
        this.addPrePos(data.prePosApi)
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
    // this.getCanaisFromFirestore()
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
      console.log("yyyy: ",value)
      console.log("xxxx: ",this.programaDeTv.filter(prog=>prog.value==value))
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
      this.gerarListasDeBlocos()
      unsubscribe.unsubscribe()
    })

  }

  addTituloDeProgramas(){
    this.canais.map((canal,canalIndex)=>{
      if(canal.canal==5){
        this.semana.map((diaDaSemana:any)=>{
          this.canais[canalIndex][diaDaSemana].map((prog,progIndex)=>{
            this.canais[canalIndex][diaDaSemana][progIndex].tituloAtracao =
            this.programaDeTv.find(programa=>programa.value==prog.atracao).titulo
          })
        })
      }
    })
  }
  
  removePrograma(){
    if(this.selectedDiaDaSemana&&this.programaSelectionado){
      let indexToRemove = this.programaSelectionado.indice+1
      let itemRemoved = this.listaSemana[this.selectedDiaDaSemana][this.programaSelectionado.indice]
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


    } else if(!this.programaSelectionado){
      this.alerta="Selecione programa a ser deletado"
    } else if(!this.selectedDiaDaSemana){
      this.alerta="Informe o dia da semana"
    } else if(!this.programaSelectionado){
      this.alerta="Selecione programa a ser deletado"
    }
  }

  organizaIntervalos(){
    let listaParaORganizar = this.emProcessoDeUpdate? this.listaParaUpdate : this.listaSemana[this.selectedDiaDaSemana]
    
    let qtdeAdicionada = (this.qtdeIntervalos*2)+1
    let lengthListaParaOrganizar = listaParaORganizar.length
    let diiferenca = lengthListaParaOrganizar-qtdeAdicionada
    let listaInicial = listaParaORganizar.slice(0,diiferenca)
    let listaAdicionados = listaParaORganizar.slice(diiferenca,lengthListaParaOrganizar)
    let listaAadicionadosPrograma = listaAdicionados.filter(prog=>prog.atracao.slice(0,3)!=="int")
    let listaAadicionadosIntervalos = listaAdicionados.filter(prog=>prog.atracao.slice(0,3)=="int")
    let listaOrdenada = []
    listaAadicionadosPrograma.map((prog,index)=>{
      if(index<listaAadicionadosIntervalos.length){
          listaOrdenada.push(listaAadicionadosPrograma[index])
          listaOrdenada.push(listaAadicionadosIntervalos[index])
      }else {
        listaOrdenada.push(listaAadicionadosPrograma[index])        
      }
      let listaFinal = [...listaInicial,...listaOrdenada] 
      this.qtdeIntervalos=0
      this.intervalosCount=0

      this.recalculaHorariosDeExibicao(listaFinal) 
    })
  }

  

  organizaPrePos(){
    
    let listaParaORganizar = this.emProcessoDeUpdate? this.listaParaUpdate : this.listaSemana[this.selectedDiaDaSemana]

    let prePosSelecionado = this.selectedProgramaDeTv.value.replace("prePos","").slice(1)

    let listaAdicionados = listaParaORganizar.filter(prog=>prog.atracao.includes(prePosSelecionado))

    let listaAdicionadosLength = listaAdicionados.length

    let indexToCut = listaParaORganizar.indexOf(listaParaORganizar.find(prog=>prog.atracao.includes(prePosSelecionado)))

    let listaPre = [...listaParaORganizar].splice(0,indexToCut)

    let listaPos = [...listaParaORganizar].splice(indexToCut+listaAdicionadosLength)

    let listaAadicionadosPrograma = listaAdicionados.filter(prog=>prog.atracao.slice(0,6)!=="prePos")
    let listaAadicionadosPrepos = listaAdicionados.filter(prog=>prog.atracao.slice(0,6)=="prePos")
    let listaFinal = [...listaPre,
                     [...listaAadicionadosPrepos].filter(prog=>prog.titulo.includes("Abertura"))[0],
                      ...listaAadicionadosPrograma,
                     [...listaAadicionadosPrepos].filter(prog=>prog.titulo.includes("Encerramento"))[0],
                      ...listaPos]
                      
    this.prePosCount=0
    this.prePosAvailable=false
    this.programaSelectionado=""

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
  
      if(this.selectedProgramaDeTv.value.slice(0,3).includes("int")){
        intervaloApi = this.selectedProgramaDeTv.value
      } else {
        intervaloApi = "int"+this.commonServices.toTitleCase(this.selectedProgramaDeTv.value)
      }
  
      if(intervaloApi.includes("Sessao")){    
        intervaloApi=intervaloApi.replace(/[0-9]/g, '')
      } 
  
      if(this.intervalosCount&&this.programaDeTvFiltered.find(prog=>prog.value == intervaloApi)){
        let data = {}
        data['intAmount'] = this.intervalosCount
        data['intervaloApi'] = intervaloApi
  
        this.spyListaAdicionada.next(data)
      } else if(this.qtdeIntervalos){
        this.lengthListaFinal = newList.length
        this.organizaIntervalos()
      } else if(newList.length==this.lengthListaFinal&&this.prePosAvailable){
        if(this.prePosCount>0){
          let data = {}
          data['intAmount'] = this.prePosCount
          data['prePosApi'] = this.selectedProgramaDeTv.value.includes("prePos")?
                              this.selectedProgramaDeTv.value:
                              intervaloApi.replace("int","prePos")
          this.spyListaAdicionada.next(data)
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
    this.getInfoAtracao(info,this.selectedDiaDaSemana,this.indexToAdd)
    this.selectVideoForm.get('programaDeTvFormControl').setValue(intApi)
    this.adicionarPrograma()
    this.intervalosCount--
  }

  addPrePos(prePosApi){
    this.lengthListaFinal++

    let listaAtual = this.emProcessoDeUpdate ? this.listaParaUpdate:
                     this.listaSemana[this.selectedDiaDaSemana]
    let prePosSelecionado = prePosApi.replace("prePos","").slice(1)
    let indexToSelect = listaAtual.indexOf(listaAtual.find(prog=>prog.atracao.includes(prePosSelecionado)))
    let info = listaAtual[indexToSelect]
    this.getInfoAtracao(info,this.selectedDiaDaSemana,indexToSelect)
    this.selectVideoForm.get('programaDeTvFormControl').setValue(prePosApi)
    this.adicionarPrograma()
    this.prePosCount--
  }

  adicionarPrograma(): void {
    // CHECK IF DIA DA SEMANA AND PROGRAMA DE TV ARE SELECTED
    if(this.selectedDiaDaSemana&&this.selectedProgramaDeTv){
    
    let unsubscribe=
    this.mongodbService.getProgramasDeTv(this.selectedProgramaDeTv.tipo,this.selectedProgramaDeTv.value)
    .subscribe((data:any ) => {
      let videoAdicionado

      let listaDeProgramas = data

      const montaLista = ()=>{
        
        let listaFiltrada = listaDeProgramas.filter(video=>video.order&&!video.added)
          .sort(this.commonServices.sortPor("order"))
          
          if(listaFiltrada.length>0){

                    let prog:any = this.selectedProgramaDeTv
                    
                    if(!this.prePosAvailable&&prog.anexos&&prog.anexos.prePos){
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

                      this.indexToAdd = this.programaSelectionado ? this.programaSelectionado.indice+1 : listInProcess.length
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
    } else if(!this.programaSelectionado){
      this.alerta="Selecione programa a ser deletado"
    }
  }

  replicaNext(){
    this.programaSelectionado=""

    if(this.programasReplicadosCount==0&&this.emProcessoDeUpdate){
      
      this.listaSemana[this.selectedDiaDaSemana] = this.listaParaUpdate
      this.listaParaUpdate=[]
      this.emProcessoDeUpdate=false
    } else {

      this.programasReplicadosCount--
      let programaParaReplicar = this.listaOrigemReduzida[this.programasReplicadosCount]
      if(programaParaReplicar.includes("oaventura")&&
         programaParaReplicar.includes("ocomedia")){
             programaParaReplicar=programaParaReplicar.slice(0,-1)+
             this.semana.indexOf(this.selectedDiaDaSemana)+1
      } 
  
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
    if(this.programaSelectionado&&(this.programaSelectionado.indice==index)&&(this.programaSelectionado.dia==dia)){
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
    this.programaSelectionado=""
    if(this.programaBlocoSelectionado==info){
      this.programaBlocoSelectionado=""
    }else{
      info.indice=index
      info.dia=dia
      this.programaBlocoSelectionado = info
      this.selectedDiaDaSemana = dia
    }
  }

  getInfoAtracao(info,dia,index){
    this.getInfoClicado=true
    this.getInfoBlocoClicado=false
    this.getInfoFromBlocoClicado=false
    this.alerta=""
    this.programaBlocoSelectionado=""
    if(this.programaSelectionado==info){
      this.programaSelectionado=""
    }else{
      info.indice=index
      info.dia=dia
      this.programaSelectionado = info
      this.selectVideoForm.get('semanaFormControl').setValue(dia)
      this.selectedDiaDaSemana = dia
    }
  }

  getInfoAtracaoFromBloco (info,dia,index){

    this.getInfoFromBlocoClicado=true
    this.programaSelectionado = info

  }

  clearInfoAtracao(){
      this.programaSelectionado=""
  }

  toggleSemanaDestino(){
    this.exibeSemanaDestino=!this.exibeSemanaDestino
    this.selectedDiaDestinoDaSemana=""
    this.emProcessoDeUpdate=false
    this.selectVideoForm.get('semanaDestinoFormControl').setValue("")
  }

  replicaListaDaSemana(){
    this.programaSelectionado=""
    if(this.selectedDiaDestinoDaSemana){
      this.listaSemana[this.selectedDiaDestinoDaSemana]=[]
      let listaOrigem = this.listaSemana[this.selectedDiaDaSemana] 
      let listaCorujao = listaOrigem.filter(prog=>prog.atracao=="corujao"&&prog.inicio<60).map(prog=>prog.atracao)
      this.listaOrigemReduzida = [...new Set(listaOrigem.map(prog=>prog.atracao)
                                 .filter(prog=>prog.slice(0,3)!="int")
                                 .filter(prog=>prog.slice(0,6)!="prePos"))]
      this.listaOrigemReduzida.reverse()
      this.selectVideoForm.get('semanaFormControl').setValue(this.selectedDiaDestinoDaSemana)
      this.programasReplicadosCount = this.listaOrigemReduzida.length-1
      let sessaoDia = this.semana.indexOf(this.selectedDiaDestinoDaSemana)+1
      this.listaOrigemReduzida.map((prog,index)=>{
        if(prog.includes("sessaoAventura")||prog.includes("sessaoComedia")){
          this.listaOrigemReduzida[index]=prog.slice(0,-1)+sessaoDia
        }
      })
      if(listaCorujao){
        let IndexOfCorujao = this.listaOrigemReduzida.indexOf("corujao")
        let listaReduzidaPreCorujao = [...this.listaOrigemReduzida.splice(0,IndexOfCorujao)]
        let listaReduzidaPosCorujao = [...this.listaOrigemReduzida.splice(IndexOfCorujao)]
        this.listaOrigemReduzida=[]
        this.listaOrigemReduzida=[...listaReduzidaPreCorujao,...listaCorujao,...listaReduzidaPosCorujao]
      }
      this.selectVideoForm.get('programaDeTvFormControl').setValue(this.listaOrigemReduzida[this.programasReplicadosCount])
      this.adicionarPrograma()
    }
  }
 
  updateListaDaSemana(){
    this.emProcessoDeUpdate=true
    this.programaSelectionado=""
    this.listaParaUpdate=[]
    let listaOrigem = this.listaSemana[this.selectedDiaDaSemana] 
    this.listaOrigemReduzida = [...new Set(listaOrigem.map(prog=>prog.atracao)
                                 .filter(prog=>prog.slice(0,3)!="int")
                                 .filter(prog=>prog.slice(0,6)!="prePos"))]
    this.listaOrigemReduzida.reverse()
    this.programasReplicadosCount = this.listaOrigemReduzida.length-1
    // listaOrigemReduzida.map(programa=>{
    this.selectVideoForm.get('programaDeTvFormControl').setValue(this.listaOrigemReduzida[this.programasReplicadosCount])
    this.adicionarPrograma()
    // })
  }

  gerarListasDeBlocos(){
    // this.canais.map((canal:any,indCanal)=>{
      let canal = this.canais.filter(canal=>canal.emissora==this.selectedCanal)[0]
      let indCanal = this.canais.indexOf(canal)

      this.semana.map((dia:any)=>{
        let listaOriginal = canal[dia]
        if(listaOriginal){
        let listaDiaReduzida = [...new Set(listaOriginal.map(prog=>prog.atracao)
          .filter(prog=>prog.slice(0,3)!="int")
          .filter(prog=>prog.slice(0,6)!="prePos"))]

        let listaBlocos = listaDiaReduzida.map((prog:any)=>{
          let obj:any = {}
          obj.atracao = prog
          let blocos = listaOriginal.filter(prog2=>{
            let includeTerm = prog.slice(1)
            
            if(includeTerm.includes("essao")){    
              includeTerm=includeTerm.replace(/[0-9]/g, '')
            }
            

            return prog2.atracao.includes(includeTerm)
          })
          
          obj.horarioDeExibicao = blocos[0].horarioDeExibicao
          obj.blocos = blocos
          if(blocos.filter(lista=>lista.tipo!="intervalos").length>0){
            obj.arquivo = blocos.filter(lista=>lista.tipo!="intervalos")[0].titulo
            obj.tituloAtracao = blocos.filter(lista=>lista.tipo!="intervalos")[0].tituloAtracao
          }
          obj.tempoTotalEmSegundos = blocos.map(lista=>lista.duracaoTotalDaAtracaoEmSegundos).reduce((a,b)=>{return a+b})
          obj.tempoTotal = this.commonServices.toTime(obj.tempoTotalEmSegundos)
          return obj
        })
        this.canais[indCanal][dia+"Bloco"]=listaBlocos}
      })

      if(canal.emissora=="Globo"){
        this.listaSemana=this.canais[indCanal]
        let semanaBloco = this.semana.map(dia=>dia+"Bloco")
        this.semana = [...this.semana,...semanaBloco]
      }
  }

  
}
