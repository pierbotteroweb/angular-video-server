import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
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

  update(mimeType:string,id: string, media: any): Promise<void> {
    return this[mimeType.replace("Filmes","")+"Ref"].doc(id).update(media);
  }
  
}