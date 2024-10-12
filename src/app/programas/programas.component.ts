import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UploadVideoService } from '../services/upload-video.service';
import { CommonService } from 'src/services/common.service';
import { MongodbService } from '../services/mongodb.service';
import { sts } from 'shuffle-tv-services/lib'
import { ProgramaModel } from './programa';


@Component({
  selector: 'app-programas',
  templateUrl: './programas.component.html',
  styleUrls: ['./programas.component.scss']
})
export class ProgramasComponent implements OnInit {
  

  // Set ep uma interface de dados do Javascript
  // que usamos aqui para evitar que arquivos duplicado ssejam enviados.
  // Mas poderiamos ter usado um tipo Array
  videosToUpload: any;
  subscription: Subscription
  progress:number = 0
  novoPrograma:FormControl
  buttonMode:string
  tituloAtracao:string
  
  selectedCanal:string
  currentRefList:[]
  selectedProgramaDeTv:string
  selectedTipoDeVideo:string
  clickedProgramaDeTv:ProgramaModel
  clickedProgramaDeTvAnexo:ProgramaModel
  canais: Array<any>
  tiposDeVideo: Array<any> = [
    { value: "listaNoite", titulo: "noite", port: "5091" },
    { value: "listaDublados", titulo: "dublado", port: "5091" },
    { value: "listaMadrugada", titulo: "madrugada", port: "5091" },
    { value: "novelas", titulo: "novelas", port: "5091" },
    { value: "listaOriginais", titulo: "originais", port: "5091" },
    { value: "listaIntervalos", titulo: "intervalos", port: "5091" },
    { value: "listaMovies", titulo: "movies", port: "5091" },
    { value: "listaDvds", titulo: "dvds", port: "5091" }
  ];
  programaDeTv: ProgramaModel[]
  programaDeTvFiltered: ProgramaModel[]
  programaDeTvTable: ProgramaModel[]
  programaDeTvPrePosFiltered: ProgramaModel[]
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
      private commonServices: CommonService,
      private uploadVideoService: UploadVideoService,
      private mongodbService: MongodbService,
      // private firebaseService: FirebaseService,
      private formBuilder: FormBuilder) { 
        this.selectVideoForm = this.formBuilder.group({
          canaisFormControl:[""],
          tipoDeVideoFormControl:[""],
          programaDeTvFormControl:[""],
          subProgramaDeTvFormControl:[""],
          prePosProgramaDeTvFormControl:[""],
          filtroDeBuscaFormControl:[""]
        })
       }
  

  ngOnInit() {
      this.getListaDeProgramasDeTvFromMongoDB()
      this.getCanaisFromMongoDB()

      this.novoPrograma = new FormControl("")


      this.selectVideoForm.get('canaisFormControl')
      .valueChanges.subscribe(value=>{
        if(this.canais){
          this.selectedCanal=this.canais.filter(canal=>canal._id==value)[0].emissora
          this.filterProgramaDeTV(this.selectedCanal)
        }
      })

      this.selectVideoForm.get('programaDeTvFormControl')
      .valueChanges.subscribe(value=>{
        this.selectedProgramaDeTv=value
        this.tituloAtracao = this.programaDeTv.find(prog=>prog.value==value).titulo
      })

      this.selectVideoForm.get('tipoDeVideoFormControl')
      .valueChanges.subscribe(value=>{
        this.tiposDeVideo.map(tipo=>{
          if(tipo.value==value){
            this.selectedTipoDeVideo=tipo.titulo
            this.filterProgramaDeTV(this.selectedCanal,this.selectedTipoDeVideo)
          }
        })
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
      if(this.selectedCanal){            
       data = [...data.filter(prog=>{ return prog.canal==this.selectedCanal})]
      }
      this.programaDeTvTable=
      this.programaDeTvFiltered=
      this.programaDeTv=data.sort(sts.sortPorTitulo())
      if(this.selectedCanal){            
        this.filterProgramaDeTV(this.selectedCanal)
      }
      unsubscribe.unsubscribe()
    })
  }

  filterProgramaDeTV(canal,tipo?){
      let unfiltered
      if(tipo){
        unfiltered = this.programaDeTv.filter(prog=> prog.canal == canal && prog.tipo == tipo )
      } else {
        unfiltered = this.programaDeTv.filter(prog=> prog.canal == canal)
      }
      this.programaDeTvPrePosFiltered = unfiltered.filter(prog=>(prog.titulo.includes("Int ") || prog.titulo.includes("Pre Pos ")))
      // this.programaDeTvFiltered= unfiltered.filter(prog=>(!prog.titulo.includes("Int ") && !prog.titulo.includes("Pre Pos ") ))
      this.programaDeTvFiltered= unfiltered
  }

  updateTableWithClickedProgramaDeTv(data){
    if(data.tipo!=="intervalos"){
      this.clickedProgramaDeTv = data
      this.programaDeTvTable = []
      this.programaDeTvTable.push(data)
      if(data.anexos.intervalo){
        this.programaDeTvTable.push(this.programaDeTv.find(prog=>prog.value==data.anexos.intervalo))

      }
      if(data.anexos.prePos){
        this.programaDeTvTable.push(this.programaDeTv.find(prog=>prog.value==data.anexos.prePos))

      }
      for(let i=1;i<=data.anexos.blocosAmount;i++){
        if(data.anexos['bloco'+i]){
          data.anexos['bloco'+i].map(bloco=>{
            let toPush = this.programaDeTv.find(prog=>prog.value==bloco)
            toPush['bloco'] = 'bloco'+i
            this.programaDeTvTable.push(toPush)
          })
        }
      }
    }
  }

  onRowSelect(event) {
      if(event.data.tipo=="intervalos"||event.data.bloco){
        this.clickedProgramaDeTvAnexo = event.data
        console.log(event.data)
      } else {
        this.updateTableWithClickedProgramaDeTv(event.data)
        console.log(this.clickedProgramaDeTv)
        console.log(event.data)
      }
  }

  onRowUnselect(event) {
    console.log(this.clickedProgramaDeTv)
    console.log(event.data)
    if(this.clickedProgramaDeTv._id==event.data._id){
      this.programaDeTvTable=this.programaDeTv
    }
  }

  deleteSelected() {
    if(this.clickedProgramaDeTvAnexo){
      if(this.clickedProgramaDeTvAnexo.tipo=="intervalos"){
        if(this.clickedProgramaDeTvAnexo.prePos){
          this.clickedProgramaDeTv.anexos["prePos"] = ""
        } else {
          this.clickedProgramaDeTv.anexos["intervalo"] = ""
        }
      } else {
          this.clickedProgramaDeTv.anexos[this.clickedProgramaDeTvAnexo.bloco] =
          this.clickedProgramaDeTv.anexos[this.clickedProgramaDeTvAnexo.bloco]
          .filter(bloco=>bloco!=this.clickedProgramaDeTvAnexo.value)
      }
      let anexosObj:any ={
        _id:this.clickedProgramaDeTv._id,
        anexos:this.clickedProgramaDeTv.anexos
      }

      this.mongodbService.updateProgramaDeTv(anexosObj).subscribe((res:any)=>{
          this.updateTableWithClickedProgramaDeTv(res)
      })
      
    } else {
      console.log("Delete Programa")
      console.log(this.clickedProgramaDeTv)
    }
  }
  
  addAnexos(tipo){
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
        this.updateTableWithClickedProgramaDeTv(res)
    })
  }

  deleteFromMongoDB(id): void {
    this.mongodbService.deleteFromVideoCollection(this.selectedTipoDeVideo,id).subscribe(() => {
    });
  }

  updateOnMongoDB(video):void {
    this.mongodbService.updateVideo(video._id,video).subscribe(() => {
      console.log('Video updated successfully!');
    });
    
  }

}
