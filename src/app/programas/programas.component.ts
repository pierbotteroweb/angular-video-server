import {Component, OnInit} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MongodbService } from '../services/mongodb.service';
import { sts } from 'shuffle-tv-services/lib'
import { ProgramaModel } from './programa';


@Component({
  selector: 'app-programas',
  templateUrl: './programas.component.html',
  styleUrls: ['./programas.component.scss']
})
export class ProgramasComponent implements OnInit {
  

  tituloAtracao:string
  
  selectedCanal:string
  currentRefList:[]
  selectedProgramaDeTv:string
  selectedmimeType:string
  clickedProgramaDeTv:ProgramaModel | null = null
  clickedProgramaDeTvAnexo:ProgramaModel | null = null
  canais: Array<any>
  tiposDeVideo: Array<any> = [
    { value: "listaNoite", titulo: "noite"},
    { value: "listaDublados", titulo: "dublado"},
    { value: "listaMadrugada", titulo: "madrugada"},
    { value: "novelas", titulo: "novelas"},
    { value: "listaOriginais", titulo: "originais"},
    { value: "listaIntervalos", titulo: "intervalos"},
    { value: "listaMovies", titulo: "movies"},
    { value: "listaDvds", titulo: "dvds"}
  ];
  programaDeTv: ProgramaModel[]
  programaDeTvFiltered: ProgramaModel[]
  programaDeTvTable: ProgramaModel[]
  programaDeTvPrePosFiltered: ProgramaModel[]
  exibirProgramaModal = false
  modoCriacaoPrograma = false
  programaSelecionadoModal: ProgramaModel | null = null
  cols:Array<any>=[
    { header:'titulo', width:{"min-width":"400px"} },
    { header:'canal', width:{"min-width":"100px"} },
    { header:'tipo', width:{"min-width":"100px"} },
    { header:'bloco', width:{"min-width":"100px"} },
    { header:'usado em', width:{"min-width":"100px"} },
  ]
  selectVideoForm :any
  listaParaAtualizar:any=[]
  sts = sts;

  constructor(
      private mongodbService: MongodbService,
      // private firebaseService: FirebaseService,
      private formBuilder: FormBuilder) { 
        this.selectVideoForm = this.formBuilder.group({
          canaisFormControl:[""],
          mimeTypeFormControl:[""],
          programaDeTvFormControl:[""],
          subProgramaDeTvFormControl:[""],
          prePosProgramaDeTvFormControl:[""],
          filtroDeBuscaFormControl:[""]
        })
       }
  

  ngOnInit() {
      this.getListaDeProgramasDeTvFromMongoDB()
      this.getCanaisFromMongoDB()

      this.selectVideoForm.get('canaisFormControl')
      .valueChanges.subscribe(value=>{
        if(this.canais){
          const canalSelecionado = this.canais.find(canal=>canal._id==value)
          this.selectedCanal = canalSelecionado ? canalSelecionado.emissora : ""
          this.filterProgramaDeTV()
        }
      })

      this.selectVideoForm.get('programaDeTvFormControl')
      .valueChanges.subscribe(value=>{
        this.selectedProgramaDeTv=value
        this.tituloAtracao = this.programaDeTv.find(prog=>prog.value==value).titulo
      })

      this.selectVideoForm.get('mimeTypeFormControl')
      .valueChanges.subscribe(value=>{
        const tipoSelecionado = this.tiposDeVideo.find(tipo=>tipo.value==value)
        this.selectedmimeType = tipoSelecionado ? tipoSelecionado.titulo : ""
        this.filterProgramaDeTV()
      })

  }
  
  getCanaisFromMongoDB(){
    let unsubscribe=
    this.mongodbService.getCanais().subscribe((data:any )=>{ 
      this.canais=data.sort(sts.sortPor("canal"))
      unsubscribe.unsubscribe()
    })
  }

  getListaDeProgramasDeTvFromMongoDB(){
    let unsubscribe=
    this.mongodbService.getListaDeProgramasDeTv()
    .subscribe((data:any)=>{
      this.programaDeTv=
      this.programaDeTvFiltered=data.sort(sts.sortPorTitulo())
      this.filterProgramaDeTV()
      unsubscribe.unsubscribe()
    })
  }

  getProgramasDaTabelaPrincipal(lista: ProgramaModel[]): ProgramaModel[] {
    return lista.filter(programa => programa.tipo !== "intervalos")
  }

  filterProgramaDeTV(canal = this.selectedCanal, tipo = this.selectedmimeType){
      if(!this.programaDeTv){
        return
      }

      let unfiltered = this.programaDeTv

      if(canal){
        unfiltered = unfiltered.filter(prog=> prog.canal == canal)
      }

      if(tipo){
        unfiltered = unfiltered.filter(prog=> prog.tipo == tipo)
      }

      this.programaDeTvPrePosFiltered = unfiltered.filter(prog=>(prog.titulo.includes("Int ") || prog.titulo.includes("Pre Pos ")))
      // this.programaDeTvFiltered= unfiltered.filter(prog=>(!prog.titulo.includes("Int ") && !prog.titulo.includes("Pre Pos ") ))
      this.programaDeTvFiltered= unfiltered
      this.programaDeTvTable=this.getProgramasDaTabelaPrincipal(unfiltered)
  }

  abrirModalPrograma(programa: ProgramaModel): void {
    this.modoCriacaoPrograma = false
    this.clickedProgramaDeTv = programa
    this.programaSelecionadoModal = programa
    this.exibirProgramaModal = true
  }

  abrirModalCriacaoPrograma(): void {
    this.clickedProgramaDeTv = null
    this.clickedProgramaDeTvAnexo = null
    this.programaSelecionadoModal = null
    this.modoCriacaoPrograma = true
    this.exibirProgramaModal = true
  }

  limparSelecaoPrograma(): void {
    this.clickedProgramaDeTv = null
    this.clickedProgramaDeTvAnexo = null
    this.programaSelecionadoModal = null
    this.modoCriacaoPrograma = false
    this.exibirProgramaModal = false
  }

  deletarProgramaModal(programa: ProgramaModel): void {
    if(!programa){
      return
    }

    this.mongodbService.deleteProgramaDeTv(programa).subscribe((res:any)=>{
      console.log(res)
      this.removerProgramaDasListas(programa)
      this.limparSelecaoPrograma()
    })
  }

  salvarProgramaModal(event:any): void {
    if(event && event.acao === 'criar'){
      this.criarProgramaOnMongoDb(event.programa)
      return
    }

    if(!event || !event.programa){
      return
    }

    const programa = event.programa
    const anexos = this.normalizarAnexosDoModal(event.anexos || {})
    const programaAtualizado:any = {
      _id: programa._id,
      anexos: anexos
    }

    this.mongodbService.updateProgramaDeTv(programaAtualizado).subscribe((res:any)=>{
      this.atualizarProgramaNasListas(res)
      this.clickedProgramaDeTv = res
      this.programaSelecionadoModal = res
    })
  }

  criarProgramaOnMongoDb(programaCriacao:any): void {
    if(!programaCriacao || !programaCriacao.canal || !programaCriacao.titulo || !programaCriacao.tipo){
      console.log("Selecione um canal, um tipo de vídeo e informe o nome do programa de TV")
      return
    }

    const titulo = programaCriacao.titulo
    const newProg:any = {
      titulo: titulo,
      tipo: programaCriacao.tipo,
      value: sts.camelize(titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, "")),
      canal: programaCriacao.canal,
      prePos: titulo.includes("Pre") ? true : false
    }

    this.mongodbService.createProgramaDeTv(newProg).subscribe((prog:any)=>{
      this.getListaDeProgramasDeTvFromMongoDB()
      this.modoCriacaoPrograma = false
      this.exibirProgramaModal = false
      this.programaSelecionadoModal = null
    })
  }

  normalizarAnexosDoModal(anexos:any): any {
    const anexosNormalizados:any = {
      ...anexos,
      intervalo: anexos.intervalo || "",
      prePos: anexos.prePos || "",
      blocosAmount: 0
    }

    for(let i=1;i<=6;i++){
      const blocoKey = "bloco"+i
      const programasDoBloco = Array.isArray(anexos[blocoKey]) ? anexos[blocoKey] : []
      anexosNormalizados[blocoKey] = programasDoBloco.filter(programa=>!!programa)

      if(anexosNormalizados[blocoKey].length>0){
        anexosNormalizados.blocosAmount = i
      }
    }

    return anexosNormalizados
  }

  atualizarProgramaNasListas(programaAtualizado: ProgramaModel): void {
    this.programaDeTv = this.substituirProgramaNaLista(this.programaDeTv, programaAtualizado)
    this.programaDeTvFiltered = this.substituirProgramaNaLista(this.programaDeTvFiltered, programaAtualizado)
    this.programaDeTvTable = this.getProgramasDaTabelaPrincipal(this.substituirProgramaNaLista(this.programaDeTvTable, programaAtualizado))
  }

  substituirProgramaNaLista(lista: ProgramaModel[], programaAtualizado: ProgramaModel): ProgramaModel[] {
    if(!lista){
      return lista
    }

    return lista.map(programa=>{
      return programa._id==programaAtualizado._id ? programaAtualizado : programa
    })
  }

  removerProgramaDasListas(programaRemovido: ProgramaModel): void {
    this.programaDeTv = this.removerProgramaDaLista(this.programaDeTv, programaRemovido)
    this.programaDeTvFiltered = this.removerProgramaDaLista(this.programaDeTvFiltered, programaRemovido)
    this.programaDeTvPrePosFiltered = this.removerProgramaDaLista(this.programaDeTvPrePosFiltered, programaRemovido)
    this.programaDeTvTable = this.getProgramasDaTabelaPrincipal(this.removerProgramaDaLista(this.programaDeTvTable, programaRemovido))
  }

  removerProgramaDaLista(lista: ProgramaModel[], programaRemovido: ProgramaModel): ProgramaModel[] {
    if(!lista){
      return lista
    }

    return lista.filter(programa=>programa._id!=programaRemovido._id)
  }

  deleteSelected(programaParaRemover?: ProgramaModel) {
    if(!this.clickedProgramaDeTv){
      return
    }

    const programaSelecionadoParaRemover = programaParaRemover || this.clickedProgramaDeTvAnexo

    if(programaSelecionadoParaRemover){
      if(programaSelecionadoParaRemover.tipo=="intervalos"){
        if(programaSelecionadoParaRemover.prePos){
          this.clickedProgramaDeTv.anexos["prePos"] = ""
        } else {
          this.clickedProgramaDeTv.anexos["intervalo"] = ""
        }
      } else {
          this.clickedProgramaDeTv.anexos[programaSelecionadoParaRemover.bloco] =
          this.clickedProgramaDeTv.anexos[programaSelecionadoParaRemover.bloco]
          .filter(bloco=>bloco!=programaSelecionadoParaRemover.value)
      }
      let anexosObj:any ={
        _id:this.clickedProgramaDeTv._id,
        anexos:this.clickedProgramaDeTv.anexos
      }

      this.mongodbService.updateProgramaDeTv(anexosObj).subscribe((res:any)=>{
        this.programaDeTv.map((item,index)=>{
          if(item._id==res._id){
            this.programaDeTv[index]=res
          }
        })
      })
      
    } else {
      console.log("Delete Programa")
    }
  }
  
  addAnexos(tipo){
    if(!this.clickedProgramaDeTv){
      console.log("Selecione um programa antes de adicionar anexos")
      return
    }

    let anexosObj:any ={
      _id:this.clickedProgramaDeTv._id,
      anexos:{}
    }

    if(this.clickedProgramaDeTv.anexos){
      anexosObj.anexos = this.clickedProgramaDeTv.anexos
    }

    if(tipo.includes("bloco")){
      if(!anexosObj.anexos[tipo]){
        anexosObj.anexos[tipo]=[]
      }
      anexosObj.anexos[tipo].push(this.selectedProgramaDeTv)
      anexosObj.anexos.blocosAmount=0
      for(let i=1;i<6;i++){
        if(anexosObj.anexos["bloco"+(i)]&&anexosObj.anexos["bloco"+(i)].length>0){
          anexosObj.anexos.blocosAmount=i          
        }
      }
      
    } else {
      anexosObj.anexos[tipo]=this.selectedProgramaDeTv
    }

    this.mongodbService.updateProgramaDeTv(anexosObj).subscribe((res:any)=>{
      this.programaDeTv.map((item,index)=>{
        if(item._id==res._id){
          this.programaDeTv[index]=res
        }
      })
    })
  }

  deleteFromMongoDB(id): void {
    this.mongodbService.deleteFromVideoCollection(this.selectedmimeType,id).subscribe(() => {
    });
  }

  updateOnMongoDB(video):void {
    this.mongodbService.updateVideo(video._id,video).subscribe(() => {
      console.log('Video updated successfully!');
    });
    
  }

}
