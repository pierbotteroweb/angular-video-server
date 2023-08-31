import {Component, OnInit} from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { map } from 'rxjs/operators';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filterResponse, uploadProgress } from 'src/app/shared/rxjs-operators';
import { UploadVideoService } from '../services/upload-video.service';
import { CommonService } from 'src/services/common.service';
import { VideoModel } from './video';
import { MongodbService } from '../services/mongodb.service';


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
  
  selectedVideos: VideoModel[];
  selectedCanal:string
  currentRefList:[]
  selectedProgramaDeTv:string
  selectedTipoDeVideo:string
  videosFiltered: VideoModel[]
  videos: VideoModel[]
  canais: Array<any>
  tiposDeVideo: Array<any> = [
    { value: "listaNoite", titulo: "noite", port: "5000" },
    { value: "listaDublados", titulo: "dublado", port: "5000" },
    { value: "listaMadrugada", titulo: "madrugada", port: "5000" },
    { value: "novelas", titulo: "novelas", port: "5000" },
    { value: "listaOriginais", titulo: "originais", port: "5000" },
    { value: "listaIntervalos", titulo: "intervalos", port: "5000" },
    { value: "listaMovies", titulo: "movies", port: "5000" },
    { value: "listaDvds", titulo: "dvds", port: "5000" }
  ];
  programaDeTv: Array<any>=[]
  programaDeTvFiltered: Array<any>=[]
  programaDeTvPrePosFiltered: Array<any>=[]
  cols:Array<any>=[
    { header:'titulo', width:{"min-width":"400px"} },
    { header:'duracao', width:{"min-width":"50px"} },
    { header:'programa', width:{"min-width":"250px"} },
    { header:'canal', width:{"min-width":"100px"} },
    { header:'tipo', width:{"min-width":"100px"} },
    { header:'added', width:{"min-width":"100px"} },
    { header:'order', width:{"min-width":"100px"} },
    { header:'cortes', width:{"min-width":"100px"} },
  ]
  selectVideoForm :any
  listaParaAtualizar:any=[]

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
  
  // get canaisFormControl() { return this.selectVideoForm('canaisFormControl') as FormControl}

  ngOnInit() {
      // this.productService.getProductsSmall().then(data => this.products = data);
      // this.retrieve()

      // this.getListaDeProgramasDeTv()
      this.getListaDeProgramasDeTvFromMongoDB()
      this.getCanaisFromMongoDB()

      this.novoPrograma = new FormControl("")


      this.selectVideoForm.get('canaisFormControl')
      .valueChanges.subscribe(value=>{
        if(this.canais){
          this.selectedCanal=this.canais.filter(canal=>canal._id==value)[0].emissora
          if(this.videos){
            this.filterVideos(this.selectedCanal)
          }
          this.filterProgramaDeTV(this.selectedCanal)
          console.log(this.selectedCanal)
        }
      })

      this.selectVideoForm.get('programaDeTvFormControl')
      .valueChanges.subscribe(value=>{
        this.selectedProgramaDeTv=value
        this.tituloAtracao = this.programaDeTv.find(prog=>prog.value==value).titulo
      })

      this.selectVideoForm.get('subProgramaDeTvFormControl')
      .valueChanges.subscribe(value=>{
        this.addSubProgramaDeTV(value)
      })

      this.selectVideoForm.get('prePosProgramaDeTvFormControl')
      .valueChanges.subscribe(value=>{
        this.addPrePosProgramaDeTV(value)
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

  addSubProgramaDeTV(prog){
    console.log(prog)
  }

  addPrePosProgramaDeTV(prog){
    console.log(prog)
  }

  getVideosFromSelectedProgramaDeTv(){
    let programaDeTv = this.programaDeTv.find(prog=>prog.value==this.selectedProgramaDeTv)

    this.selectVideoForm.get('canaisFormControl').setValue(
      this.canais.find(canal=>canal.emissora==programaDeTv.canal)._id
    )

    this.selectVideoForm.get('tipoDeVideoFormControl').setValue(
     this.tiposDeVideo.find(tipo=>tipo.titulo==programaDeTv.tipo).value
    )

    let unsubscribe = 
    this.mongodbService.getProgramasDeTv(programaDeTv.tipo,this.selectedProgramaDeTv)
    .subscribe((data:any)=>{    
      let tempData=[]
      tempData=data
      this.videos=this.videosFiltered=tempData.sort(this.commonServices.sortPorTitulo())
      unsubscribe.unsubscribe()
    })
  }
  
  getCanaisFromMongoDB(){
    let unsubscribe=
    this.mongodbService.getCanais().subscribe((data:any )=>{ 
      this.canais=data.sort(this.commonServices.sortPor("canal"))
      console.log("this.canais",this.canais)
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
      this.programaDeTvFiltered=this.programaDeTv=data.sort(this.commonServices.sortPorTitulo())
      console.log('programasDeTVFromMongoDB',this.programaDeTvFiltered)
      if(this.selectedCanal){            
        this.filterProgramaDeTV(this.selectedCanal)
      }
      unsubscribe.unsubscribe()
    })
  }


  // getListaDeProgramasDeTv(){
  //   this.programaDeTvFiltered=[]
  //   this.programaDeTv=[]
  //   this.listaParaAtualizar=[]
  //   let unsubscribe=
  //   this.firebaseService.getAll("programasDeTv").snapshotChanges()
  //   .pipe(
  //     map(changes =>
  //       changes.map(c =>
  //         ({ id: c.payload.doc.id, ...c.payload.doc.data() })
  //       )
  //     )
  //   ).subscribe(data=>{
  //     this.programaDeTvFiltered=this.programaDeTv=data.sort(this.commonServices.sortPorTitulo())
  //     if(this.selectedCanal){            
  //       this.filterProgramaDeTV(this.selectedCanal)
  //     }
  //     unsubscribe.unsubscribe()
  //   })
  // }

  filterVideos(canal){
    this.videosFiltered = this.videos.filter((video:any)=> video.canal == canal)
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

  // upload(index){

  //   if(index<this.videosToUpload.length){
  //     let url = "http://casadopier.ddns.net:1984/api/"+this.selectVideoForm.get('tipoDeVideoFormControl').value+"Upload"

  //     let subscription = this.uploadVideoService.upload(this.videosToUpload[index], url)
  //     .pipe(
  //       uploadProgress(progress=>{
  //         this.progress=progress;
  //       }),
  //       filterResponse()
  //     ).subscribe(
  //       res=>{
  //         let videoObj:any = {
  //           canal:"",
  //           duracao:"",
  //           titulo:""
  //         }

  //         this.firebaseService.create(this.selectedTipoDeVideo,videoObj).then((newItemRes) => {
                
  //           let videoObjUpdate:any = {
  //             canal:this.selectedCanal,
  //             duracao:Math.round(res['message'].file.duration),
  //             titulo:res['message'].file.name,
  //             tipo:this.selectedTipoDeVideo,
  //             tituloAtracao:this.tituloAtracao,
  //           }

  //           if(this.selectedProgramaDeTv){
  //             videoObjUpdate.programaDeTv=this.selectedProgramaDeTv
  //           }

  //           this.firebaseService.update(this.selectedTipoDeVideo,newItemRes.id, videoObjUpdate).then(() => {
  //             if(this.selectedProgramaDeTv){
  //               this.firebaseService.addItemToRefCollection(
  //                 this.selectedProgramaDeTv,
  //                 this.selectedTipoDeVideo,newItemRes.id)
  //                 .then(data=>{
  //                   this.upload(index+1)
  //                 })
  //             }else{
  //               this.upload(index+1)
  //             }
  //           });
  //         });
  //       }
  //     )
  //   } else {
  //     this.atualizaListaLocal()
  //   }
  // }

  uploadUsingMongoDb(index){

    if(index<this.videosToUpload.length){
      let url = "http://casadopier.ddns.net:1984/api/"+this.selectVideoForm.get('tipoDeVideoFormControl').value+"Upload"

      let subscription = this.uploadVideoService.upload(this.videosToUpload[index], url)
      .pipe(
        uploadProgress(progress=>{
          this.progress=progress;
        }),
        filterResponse()
      ).subscribe(
        res=>{
          let videoObj:any = {
            canal:"",
            duracao:"",
            titulo:""
          }
      
          this.mongodbService.createVideo(this.selectedTipoDeVideo,videoObj).subscribe((newItemRes:any)=>{
            console.log("newItemRes",newItemRes)
                
            let videoObjUpdate:any = {
              duracao:Math.round(res['message'].file.duration),
              titulo:res['message'].file.name,
              tipo:this.selectedTipoDeVideo
            }

            if(this.selectedCanal){
              videoObjUpdate.canal=this.selectedCanal
            }
                  
            if(this.selectedProgramaDeTv){
              videoObjUpdate.programaDeTv=this.selectedProgramaDeTv
              videoObjUpdate.tituloAtracao=this.tituloAtracao
            }

      
            this.mongodbService.updateVideo(newItemRes._id,videoObjUpdate).subscribe((videoUpdated:any)=>{
      
              
            this.uploadUsingMongoDb(index+1)
            })
          })
        }
      )
    }
  }


  onUploadEventChange(event){
    this.listaParaAtualizar=[]
    
    const selectedFiles = <FileList>event.srcElement.files

    const fileNames = [];
    this.videosToUpload = [];
    

    for (let i = 0; i< selectedFiles.length; i++){
      let SetOfOne = new Set()
      SetOfOne.add(selectedFiles[i])
      fileNames.push(selectedFiles[i].name)
      this.videosToUpload.push(SetOfOne)
    }

    document.getElementById('customFileLabel').innerHTML = fileNames.join(', ')

    this.progress = 0

  }

  onRowSelect(event) {
      // this.messageService.add({severity:'info', summary:'Product Selected', detail: event.data.name});
      console.log("Product Selected - function onRowSelect trigered")
      console.log("event ",event)
      console.log(this.selectVideoForm.get("canaisFormControl").value)
      console.log(this.selectedTipoDeVideo)
  }

  onRowUnselect(event) {
      // this.messageService.add({severity:'info', summary:'Product Unselected',  detail: event.data.name});
      console.log("Product Unselected - function onRowUnselect trigered")
      console.log("event ",event)
  }

  clearSelect(){
    this.selectedVideos=[]
  }

  selectAll(){
    this.selectedVideos = [...this.videos]
    console.log(this.selectedVideos)
    console.log(this.selectVideoForm.get('filtroDeBuscaFormControl').value)
    let termoParaFiltro =this.selectVideoForm.get('filtroDeBuscaFormControl').value
    this.selectedVideos=this.selectedVideos.filter(video=>video.titulo.includes(termoParaFiltro))
    console.log(this.selectedVideos)
  }

  // setTipo(){
  //   // this.selectedVideos = [...this.videos];
  //   console.log(this.selectedVideos)
  //   this.selectedVideos.map((video,index)=>{
  //       this.update(this.selectedTipoDeVideo,video.id,{tipo:this.selectedTipoDeVideo})
  //       this.videos.map(video2=>{
  //         if(video.id==video2.id){
  //           video2['tipo']=this.selectedTipoDeVideo
  //         }
  //       })
  //       this.clearSelect()
  //   })    
  // }

  // setTitulodaAtracao(){
  //   console.log(this.selectedVideos)

  //   this.selectedVideos.map(video=>{
  //     console.log("setTitulodaAtracao - video", video )
  //       if(video?.programaDeTv){
  //         let tituloAtracao = this.programaDeTv.find(prog=>prog.value==video.programaDeTv)?.titulo
  //         if(tituloAtracao){
  //         this.update(this.selectedTipoDeVideo,video.id,{tituloAtracao:tituloAtracao})}
  //       }
  //   })
  // }

  setOrder(){
    this.selectedVideos.filter(video=>video.titulo
      .includes(this.selectVideoForm.get("filtroDeBuscaFormControl").value))
    .map((video:any,index)=>{

        video["order"]=index+1

        this.updateOnMongoDB(video)
        this.videos.map((video2:any)=>{
          if(video._id==video2._id){
            video2['order']=index+1
          }
        })

        this.clearSelect()
    })    
  }


  setSub(){
    this.selectedVideos.filter(video=>video.titulo
      .includes(this.selectVideoForm.get("filtroDeBuscaFormControl").value))
    .map((video:any)=>{

        video["sub"]=true

        this.updateOnMongoDB(video)
        this.videos.map((video2:any)=>{
          if(video._id==video2._id){
            video2['sub']=true
          }
        })

        this.clearSelect()
    })    
  }


  setAdded(){
    this.selectedVideos.filter(video=>video.titulo
      .includes(this.selectVideoForm.get("filtroDeBuscaFormControl").value))
      .map((video:any,index)=>{

      video["added"]=true

      this.updateOnMongoDB(video)
      this.videos.map((video2:any)=>{
        if(video._id==video2._id){
          video2['added']=true
        }
      })

        this.clearSelect()
    })    
  }



  resetAdded(){
    this.selectedVideos.filter(video=>video.titulo
      .includes(this.selectVideoForm.get("filtroDeBuscaFormControl").value))
      .map((video:any,index)=>{

      video["added"]=false

      this.updateOnMongoDB(video)
      this.videos.map((video2:any)=>{
        if(video._id==video2._id){
          video2['added']=false
        }
      })

        this.clearSelect()
    })    
  }


  clearOrder(){
    this.selectedVideos.filter(video=>video.titulo
      .includes(this.selectVideoForm.get("filtroDeBuscaFormControl").value))
    .map((video:any,index)=>{

        video["order"]=null

        this.updateOnMongoDB(video)
        this.videos.map((video2:any)=>{
          if(video._id==video2._id){
            video2['order']=null
          }
        })

        this.clearSelect()
    })    
  }

  setRandom(){
    // this.selectedVideos = [...this.videos];
    let randomIndex = this.shuffleArray(this.selectedVideos.filter(video=>video.titulo
      .includes(this.selectVideoForm.get("filtroDeBuscaFormControl").value)).map((vid,index)=> index))

    this.selectedVideos.filter(video=>video.titulo.includes(this.selectVideoForm.get("filtroDeBuscaFormControl").value)).map((video:any,index)=>{

      video["order"]=randomIndex[index]+1

      this.updateOnMongoDB(video)
        this.videos.map((video2:any)=>{
          if(video._id==video2._id){
            video2['order']=randomIndex[index]+1
          }
        })
        this.clearSelect()
    })
  }
  
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

  // addSubs(){
  //     this.selectedVideos.map(video=>{
  //         this.update(this.selectedTipoDeVideo,video.id,{sub:true})
  //     })    
  // }

  getTituloProgramaDeTv(programa){
    let progdeTv=""
    this.programaDeTv.map(prog=>{
      if(prog.value==programa){
        progdeTv = prog.titulo
      }
    })
    return progdeTv
  }

  setInt(){

  }

  setPrePos(){

  }

  setCanal(){
      this.selectedVideos.map((video:any)=>{

          video["canal"]=this.selectedCanal

          this.updateOnMongoDB(video)

          this.videos.map((video2:any)=>{
            if(video._id==video2._id){
              video2['canal']=this.selectedCanal

            }
          })
          this.clearSelect()
      })    
  }

  setProgramaDeTvOnMongoDB(index?){
    let programaQueVaiReceberVideo = this.programaDeTv.find(prog=>prog.value == this.selectedProgramaDeTv)

    
    this.selectedVideos.map((video:any)=>{
      video.programaDeTv=programaQueVaiReceberVideo.value
      video.tituloAtracao=programaQueVaiReceberVideo.titulo
      console.log("yyyyy",video,"yyyyy")
      this.mongodbService.updateVideo(video._id,video).subscribe(()=>{
        console.log('Video updated sucessfully')
        if(index){
          console.log(index)
          this.uploadUsingMongoDb(index)
        }
      })
      
    })



    // let listaDeNovasRefs = []

    // this.selectedVideos.map((video:any)=>{
      // listaDeNovasRefs.push(video._id)
      // console.log("xxxxxxxx",video,"xxxxxxxxxxxxx")
      // if(video.programaDeTv!=""){
      //   this.clearProgFromMongoDB(video)
      // }
    //   if(listaDeNovasRefs.length==this.selectedVideos.length){
    //     let listaAtualDeRefs = programaQueVaiReceberVideo.refs
    //     programaQueVaiReceberVideo.refs= [...listaAtualDeRefs, ...listaDeNovasRefs] 
    //     this.mongodbService.updateProgramaDeTv(programaQueVaiReceberVideo).subscribe(()=>{
    //       this.selectedVideos.map((video:any)=>{
    //         video.programaDeTv=programaQueVaiReceberVideo.value
    //         video.tituloAtracao=programaQueVaiReceberVideo.titulo
    //         console.log("yyyyy",video,"yyyyy")
    //         this.mongodbService.updateVideo(video._id,video).subscribe(()=>{
    //           console.log('Video updated sucessfully')
    //           if(index){
    //             console.log(index)
    //             this.uploadUsingMongoDb(index)
    //           }
    //         })
            
    //       })
    //     })
        
    //   }
    //  })
  }

  // setProgramaDeTv(){

  //     this.selectedVideos.map(video=>{
  //         this.update(video.tipo,video.id,{
  //           programaDeTv:this.selectedProgramaDeTv,
  //           tituloAtracao:this.tituloAtracao,
  //         })

  //         this.videos.map(video2=>{
  //           if(video.id==video2.id){
  //             video2['programaDeTv']=this.selectedProgramaDeTv
  //           }
  //         })
  //         this.firebaseService.addItemToRefCollection(
  //           this.selectedProgramaDeTv,
  //           this.selectedTipoDeVideo,video.id)
  //           .then(data=>{
  //           })
  //     })
      
  //     this.clearSelect()
  // }

  // addParaTia(){
  //     this.selectedVideos.map(video=>{
  //       this.update(video.tipo,video.id,{
  //         tipo:this.selectedTipoDeVideo
  //       })
  //         this.firebaseService.addItemToRefCollection(
  //           "filmeDaTia",
  //           this.selectedTipoDeVideo,video.id)
  //           .then(data=>{
  //             this.update(video.tipo,video.id,{tia:true})
  //           })
  //     })
  //     this.clearSelect()
  // }  

  clearProgFromSelected(){
    const functionThatReturnsAPromise = video => { //a function that returns a promise
      this.clearProgFromMongoDB(video)
      return Promise.resolve('ok')
    }
    
    const updateItemsAsync = async video => {
      return functionThatReturnsAPromise(video)
    }
    
    const updateAll = async () => {
      return Promise.all(this.selectedVideos.map(video => updateItemsAsync(video)))
    }
    
    updateAll().then(data => {
      console.log("Todos os itens selecionados foram deletados")
    }) 
  }  

  deleteSelected(){
    const functionThatReturnsAPromise = video => { //a function that returns a promise
      this.deleteFromMongoDB(video._id)
      return Promise.resolve('ok')
    }
    
    const deleteItemsAsync = async video => {
      return functionThatReturnsAPromise(video)
    }
    
    const deleteAll = async () => {
      return Promise.all(this.selectedVideos.map(video => deleteItemsAsync(video)))
    }
    
    deleteAll().then(data => {
      console.log("Todos os itens selecionados foram deletados")
    }) 
  }



  // retrieveSemCanal(): void {
  //   this.listaParaAtualizar=[]
  //   let unsubscribe =
  //   this.firebaseService.getAll(this.selectedTipoDeVideo).snapshotChanges().pipe(
  //     map(changes =>
  //       changes.map(c =>
  //         ({ id: c.payload.doc.id, ...c.payload.doc.data() })
  //       )
  //     )
  //   ).subscribe((data:any ) => {
  //     this.videos=data.filter(data=>{
  //       return !data.canal
  //     })
  //     .sort(this.commonServices.sortPorTitulo())
  //     console.log("videos",this.videos)
  //   });

  //   unsubscribe.unsubscribe()
  // }

  // getListMovies(){
  //   this.listaParaAtualizar=[]
  //   if(this.selectedTipoDeVideo=="dvds"||this.selectedTipoDeVideo=="movies")
  //   this.firebaseService.getAll(this.selectedTipoDeVideo).snapshotChanges()
  //   .pipe(
  //     map(changes =>
  //       changes.map(c =>
  //         ({ id: c.payload.doc.id, ...c.payload.doc.data() })
  //       )
  //     )
  //   ).subscribe((data:any)=>{
  //     this.videos=data.sort(this.commonServices.sortPorTitulo())
  //     console.log("videos Movies",this.videos)
  //   })
  // }

  // getList(canalOuPrograma): void {
  //   this.listaParaAtualizar=[]
  //   let data = canalOuPrograma=="canal"?this.selectedCanal:this.selectedProgramaDeTv
    
  //   let unsubscribe=
  //   this.firebaseService.getListFromfirestore(this.selectedTipoDeVideo,canalOuPrograma,data).snapshotChanges().pipe(
  //     map(changes =>
  //       changes.map(c =>
  //         ({ id: c.payload.doc.id, ...c.payload.doc.data() })
  //       )
  //     )
  //   ).subscribe((data:any ) => {
  //     console.log("list of programa",data)
  //     let regTeste = data.find(prog=>prog.ref=="Teste")
  //     if(regTeste){
  //       console.log("Reg Teste Found: ",regTeste)
  //       this.delete("refId",regTeste.id)
  //     }
  //     this.currentRefList=data
  //     let tempData=[]
  //     if(canalOuPrograma=="programa"){
  //       data.map(registro=>{
  //         if(registro.ref!="Teste"){
  //           registro.ref.get()
  //           .then(res=>{
  //             let obj = res.data()
  //             if(registro.ref.id){
  //               obj.id = registro.ref.id
  //               obj.refId = registro.id
  //               tempData.push(obj)
  //             }
  //           })
  //         }            
  //       })
  //     } else {
  //       this.currentRefList=[]
  //       tempData=data
  //     }
  //     setTimeout(()=>{
  //       this.videos=tempData.sort(this.commonServices.sortPorTitulo())
  //       console.log("Uma lista de prog de TV",this.videos)
  //       unsubscribe.unsubscribe()
  //     },1000)
  //   });
  // }

  criarProgramaOnMongoDb(){
    if(this.selectedCanal,this.novoPrograma.value){
      console.log("this.novoPrograma.value",this.novoPrograma.value)
      let newProg={
        titulo:this.novoPrograma.value,
        tipo:this.selectedTipoDeVideo,
        value:this.commonServices.camelize(this.novoPrograma.value.normalize('NFD').replace(/[\u0300-\u036f]/g, "")),
        canal:this.selectedCanal,
        prePos:this.novoPrograma.value.includes("Pre")?true:false
      }
      this.mongodbService.createProgramaDeTv(newProg).subscribe((prog)=>{ 
        this.getListaDeProgramasDeTvFromMongoDB()
      })
    } else {
      console.log("Selecione um canal e informe o nome do programa de TV")
    }
  }

  // criarPrograma(){
  //   if(this.selectedCanal,this.novoPrograma.value){
  //     this.firebaseService.createNewProgDeTVCollection({
  //       value:this.commonServices.camelize(this.novoPrograma.value.normalize('NFD').replace(/[\u0300-\u036f]/g, "")),
  //       titulo:this.novoPrograma.value,
  //       canal:this.selectedCanal
  //     })
  //     this.getListaDeProgramasDeTvFromMongoDB()
  //   } else {
  //     console.log("Selecione um canal e informe o nome do programa de TV")
  //   }
  // }
  
  checkIfProgExists(progValue,type){

    let intProg = this.commonServices.camelize(type+" "+progValue.normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
    let found = this.programaDeTv.find(prog=>prog.value==intProg)
    return found?true:false
  }
  

  // newInt(){
  //   if(this.selectedCanal,this.selectedProgramaDeTv){
  //     if(!this.checkIfProgExists(this.selectedProgramaDeTv,"int")){
  //       console.log(this,this.programaDeTv)
  //       let progTitulo
  //       this.programaDeTv.map(prog=>{
  //         if(prog.value==this.selectedProgramaDeTv){
  //           progTitulo=prog.titulo
  //         }
  //       })
  //       this.firebaseService.createNewProgDeTVCollection({
  //         value:"int"+this.commonServices.toTitleCase(this.commonServices.camelize(this.selectedProgramaDeTv.normalize('NFD').replace(/[\u0300-\u036f]/g, ""))),
  //         titulo:"Int "+progTitulo,
  //         canal:this.selectedCanal
  //       })

  //       setTimeout(()=>{
  //         this.getListaDeProgramasDeTvFromMongoDB()
  //         let prog = this.commonServices.toTitleCase(this.commonServices.camelize("int "+this.selectedProgramaDeTv.normalize('NFD').replace(/[\u0300-\u036f]/g, ""))) 
  //         console.log(prog) 
  //         this.selectVideoForm.get('programaDeTvFormControl').setValue("int"+prog)
  //       },1000)
  //     }
  //   } else {
  //     console.log("Selecione um canal e informe o nome do programa de TV")
  //   }
  // }
  
  

  // newPrepos(){
  //   if(this.selectedCanal,this.selectedProgramaDeTv){
  //     if(!this.checkIfProgExists(this.selectedProgramaDeTv,"prePos")){
  //       console.log(this,this.programaDeTv)
  //       let progTitulo
  //       this.programaDeTv.map(prog=>{
  //         if(prog.value==this.selectedProgramaDeTv){
  //           progTitulo=prog.titulo
  //         }
  //       })
  //       this.firebaseService.createNewProgDeTVCollection({
  //         value:"prePos"+this.commonServices.toTitleCase(this.commonServices.camelize(this.selectedProgramaDeTv.normalize('NFD').replace(/[\u0300-\u036f]/g, ""))),
  //         titulo:"Pre Pos "+progTitulo,
  //         canal:this.selectedCanal
  //       })

  //       setTimeout(()=>{
  //         this.getListaDeProgramasDeTvFromMongoDB()
  //         let prog = this.commonServices.camelize("pre Pos "+this.selectedProgramaDeTv.normalize('NFD').replace(/[\u0300-\u036f]/g, "")) 
  //         console.log(prog) 
  //         this.selectVideoForm.get('programaDeTvFormControl').setValue("prePos"+prog)
  //       },1000)
  //     }
  //   } else {
  //     console.log("Selecione um canal e informe o nome do programa de TV")
  //   }
  // }

  retreiveFromMongoDB(){
    console.log(this.selectedTipoDeVideo)
    let termoParaFiltro =this.selectVideoForm.get('filtroDeBuscaFormControl').value
    let unsubscribe =
    this.mongodbService.getFromVideoCollection(this.selectedTipoDeVideo)
    .subscribe((data:any )=> {      
      console.log("data")
      let tempData=[]
      tempData=data
      this.videos=this.videosFiltered=tempData.sort(this.commonServices.sortPorTitulo())
      unsubscribe.unsubscribe()
    });

  }
  
  // retrieve(): void {
  //   let termoParaFiltro =this.selectVideoForm.get('filtroDeBuscaFormControl').value
  //   let unsubscribe =
  //   this.firebaseService.getAll(this.selectedTipoDeVideo,termoParaFiltro).snapshotChanges().pipe(
  //     map(changes =>
  //       changes.map(c =>
  //         ({ id: c.payload.doc.id, ...c.payload.doc.data() })
  //       )
  //     )
  //   ).subscribe((data:any )=> {
      
  //     let tempData=[]
  //     tempData=data
  //     this.videos=tempData.sort(this.commonServices.sortPorTitulo())
  //     console.log("videos",this.videos)
  //     unsubscribe.unsubscribe()
  //   });

  // }

  // save(media): void {
  //   this.firebaseService.create(this.selectedTipoDeVideo,media).then((res) => {
  //     console.log('Created new item successfully! =>',res.id);
  //   });
  // }


  // update(tipo,id, media,url?): void {
  //   this.firebaseService.update(tipo,id, media).then(() => {
  //     console.log('Item updated successfully!');
  //     this.uploadVideoService.idUpdate(url.replace("Upload","videoId"),id)
  //     .subscribe(res=>{
  //       console.log('update',res)
  //     })
  //   });
  // }

  // atualizaListaLocal(){
  //   let unsubscribe=
  //     this.firebaseService.getAll(this.selectedTipoDeVideo).snapshotChanges().pipe(
  //       map(changes =>
  //         changes.map(c =>
  //           ({ id: c.payload.doc.id, ...c.payload.doc.data() })
  //         )
  //       )
  //     ).subscribe((data:any)=>{
  //       this.listaParaAtualizar=data
  //       let url = "http://casadopier.ddns.net:1984/api/"+
  //       this.selectVideoForm.get('tipoDeVideoFormControl').value+"UpdateList"
  //       this.uploadVideoService.listUpdate(this.listaParaAtualizar,url)
  //       .subscribe(res=>{
          
  //         unsubscribe.unsubscribe()
  //       })
  //     })
  // }

  // delete(tipoId,id): void {
  //   if(tipoId=="refId"){
  //     this.firebaseService.deleteRef(this.selectedProgramaDeTv,id)
    
  //   }else {
  //     this.firebaseService.delete(this.selectedTipoDeVideo,id).then(() => {
  //       console.log('Item deleted successfully!');
  //     });
  //   }
  // }

  deleteFromMongoDB(id): void {
    this.mongodbService.deleteFromVideoCollection(this.selectedTipoDeVideo,id).subscribe(() => {
      console.log('Item deleted successfully!');
    });
  }

  updateOnMongoDB(video):void {
    console.log("updateOnMongoDB",video)
    this.mongodbService.updateVideo(video._id,video).subscribe(() => {
      console.log('Video updated successfully!');
    });
    
  }

  clearProgFromMongoDB(video): void {
    let videoNovo = video
    videoNovo.programaDeTv=""
    videoNovo.tituloAtracao=""
    videoNovo.order=0
    this.mongodbService.updateVideo(video._id,video).subscribe(()=>{
      console.log('Video updated sucessfully')
    })



    // let programaDeTvASerDeletado = video.programaDeTv
    // let programaParaRemoverVideo = this.programaDeTv.find(prog=>prog.value==programaDeTvASerDeletado)
    // let indexDoProgramaParaRemoverVideo = this.programaDeTv.indexOf(programaParaRemoverVideo)
    // let listaDeVideosNoProgramaDeTV = programaParaRemoverVideo.refs
    // let idDoVideo = video._id
    // console.log("video",video)
    // console.log("idDoVideo",idDoVideo)
    // console.log("this.programaDeTv",this.programaDeTv)
    // console.log("indexDoProgramaParaRemoverVideo",indexDoProgramaParaRemoverVideo)
    // console.log("programaParaRemoverVideo",programaParaRemoverVideo)

    // programaParaRemoverVideo.refs=
    // listaDeVideosNoProgramaDeTV.filter(video=>video!=idDoVideo)
    
    // this.mongodbService.updateProgramaDeTv(programaParaRemoverVideo).subscribe(() => {
    //   console.log('Item updated successfully!');
    //   let videoNovo = video
    //   videoNovo.programaDeTv=""
    //   videoNovo.tituloAtracao=""
    //   this.mongodbService.updateVideo(idDoVideo,video).subscribe(()=>{
    //     console.log('Video updated sucessfully')
    //   })
    // });
  }

  setButtonMode(mode){
    this.buttonMode=mode
  }
}
