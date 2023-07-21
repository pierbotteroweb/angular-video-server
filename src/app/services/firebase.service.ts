import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { Subject } from 'rxjs';
import Media from '../models/media.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private dbPathDublado = '/dublado';
  private dbPathMadrugada = '/madrugada';
  private dbPathNoite = '/noite';
  private dbPathNovelas = '/novelas';
  private dbPathOriginais = '/originais';
  private dbPathMovies = '/movies';
  private dbPathDvds = '/dvds';
  private telaQuente = '/telaQuente';
  private intervalos = '/intervalos';
  private canais = '/canais';

  dubladoRef: AngularFirestoreCollection<Media>;
  madrugadaRef: AngularFirestoreCollection<Media>;
  noiteRef: AngularFirestoreCollection<Media>;
  novelasRef: AngularFirestoreCollection<Media>;
  originaisRef: AngularFirestoreCollection<Media>;
  moviesRef: AngularFirestoreCollection<Media>;
  dvdsRef: AngularFirestoreCollection<Media>;
  telaQuenteRef: AngularFirestoreCollection<any>;
  intervalosRef: AngularFirestoreCollection<any>;
  canaisRef: AngularFirestoreCollection<any>;
  

  constructor(private db: AngularFirestore) { 
    this.dubladoRef = db.collection(this.dbPathDublado);
    this.madrugadaRef = db.collection(this.dbPathMadrugada);
    this.noiteRef = db.collection(this.dbPathNoite);
    this.novelasRef = db.collection(this.dbPathNovelas);
    this.originaisRef = db.collection(this.dbPathOriginais);
    this.moviesRef = db.collection(this.dbPathMovies);
    this.dvdsRef = db.collection(this.dbPathDvds);
    this.telaQuenteRef = db.collection(this.telaQuente);
    this.intervalosRef = db.collection(this.intervalos);
    this.canaisRef = db.collection(this.canais);
  }
  
  camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  // getSeletorDeCanal():AngularFirestoreCollection<Media>{
  //   return this.db.collection("/seletorDeCanal",ref=>ref.onSnapshot(snap=>{
  //       console.log(snap)
  //     })
  //   )
  // }

  getSeletorDeCanal():any{
    return this.db.collection("seletorDeCanal")
    // .ref.onSnapshot(snap=>{
    //   console.log(snap)
    // })
  }

  updateSeletorDeCanal(canal:any): Promise<void> {
    return this.db.collection("seletorDeCanal").doc("pH7Lq3xFU2KZYPLc9Nmm").update(canal);
  }
  

  getAll(collectionName, term?): AngularFirestoreCollection<Media> {
    if(term){      console.log("A")
      return this.db.collection(collectionName,ref=>
        ref.where('titulo', '>=', term)
           .where('titulo', '<=', term+ '\uf8ff'))
    } else {
      return this.db.collection(collectionName);
    }
  }

  getListFromfirestore(tipoDeVideo:string,tipoDeLista?:any,data?:any): AngularFirestoreCollection<Media> {
    if(tipoDeLista=="canal"){
      return this.db.collection(tipoDeVideo, ref=>
        ref.where("canal","==",data)
      ) 
    }else if(tipoDeLista=="programa"){
      return this.db.collection(data)
    } else if(tipoDeLista=="canais") {
      return this.db.collection(tipoDeLista)
    }
  }

  create(tipoDeVideo:string,media: Media): any {
    return this[tipoDeVideo+"Ref"].add({ ...media })
  }

  createNewCollection(newCollection):any{
    let colectionroute = "/"+newCollection.value
    let collectionRef: AngularFirestoreCollection<any>=this.db.collection(colectionroute)
    let media = {ref:"Teste"}
    // console.log(media.titulo.ref)
    collectionRef.add({ ...media }).then(data=>{      
      console.log("Coleção criada com sucesso")
    })
  }  

  createNewProgDeTVCollection(newProgDeTVCollection):any{
    let colectionroute = "/"+newProgDeTVCollection.value
    let collectionRef: AngularFirestoreCollection<any>=this.db.collection(colectionroute)
    let media = {ref:"Teste"}
    // console.log(media.titulo.ref)
    collectionRef.add({ ...media }).then(data=>{      
      return this.db.collection("/programasDeTv").add({ ...newProgDeTVCollection })
    })
  }  

  addItemToRefCollection(refCollection,itemCollection,itemRef):any{
    let media = {ref:this.db.doc(itemCollection+"/"+ itemRef).ref}
    // console.log(media.titulo.ref)
    return this.db.collection("/"+refCollection).add({ ...media })
  }

  update(tipoDeVideo:string,id: string, media: any): Promise<void> {
    console.log("tipoDeVideo",tipoDeVideo)
    console.log("id",id)
    console.log("media",media)
    return this[tipoDeVideo.replace("Filmes","")+"Ref"].doc(id).update(media);
  }

  delete(tipoDeVideo:string,id: string): Promise<void> {
    return this[tipoDeVideo+"Ref"].doc(id).delete();
  }

  deleteRef(refCollection,refId) {
    console.log("refCollection",refCollection)
    console.log("refId",refId)
    let collectionRef: AngularFirestoreCollection<any>=this.db.collection(refCollection)
    collectionRef.doc(refId).ref.get().then(res=>{
      res.ref.get().then(res2=>{
        let dados = res2.data()
        console.log(dados)
        if(dados.ref=="Teste"){          
          this.db.collection("/"+refCollection).doc(refId).delete();
        } else {

          let tipoDeVideo = dados.ref.path.split("/")[0]
          let idDadoOriginal = dados.ref.path.split("/")[1]
          let media = {programaDeTv:""}
          this.update(tipoDeVideo,idDadoOriginal,media).then(data=>{
            this.db.collection("/"+refCollection).doc(refId).delete();
          })

        }

      })
    })
  }
  
}