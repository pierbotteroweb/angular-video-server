import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MongodbService {  

  constructor(private http: HttpClient) { }

  getSeletorDeCanal(){
    return this.http.get('/mongodb/api/getSelectedCanal')
  }

  getCanais(){
    return this.http.get('/mongodb/api/getCanais')
  }

  getGrade(canal,diaDaSemana){
    return this.http.post('/mongodb/api/getGrade', {'canal': canal,'diaDaSemana': diaDaSemana,})
  }

  getProgramasDeTv(tipo,programaDeTv){
    return this.http.post('/mongodb/api/'+tipo, {"programaDeTv":programaDeTv})
  }

  getListaDeProgramasDeTv(){
    return this.http.get('/mongodb/api/getListaDeProgramasDeTv')
  }

  getListaDeProgramasPorCanalDeTv(canal){
    return this.http.post('/mongodb/api/getListaDeProgramasPorCanalDeTv',{"canal":canal})
  }

  getProgramaDeTvById(id){
    return this.http.post('/mongodb/api/findProgramaById', {'id': id})
  }

  getFromVideoCollection(videoCollection){
    return this.http.get('/mongodb/api/'+videoCollection)
  }

  getFromVideoCollectionById(videoCollection,id){
    return this.http.post('/mongodb/api/getVideoById/'+videoCollection.replace("Filmes",""), {'id': id})
  }

  deleteFromVideoCollection(videoCollection,videoId){
    return this.http.post('/mongodb/api/delete'+videoCollection, {'id': videoId})
  }

  updateProgramaDeTv(content){
    return this.http.post('/mongodb/api/updateProgramaDeTv', {'id': content._id,'content':content})
  }

  updateCanais(content){
    console.log(content._id)
    return this.http.post('/mongodb/api/updateCanais', {'id': content._id,'content':content})
  }

  updateSeletorDeCanal(content){
    console.log("Running updateSeletorDeCanal",content)
    return this.http.post('/mongodb/api/updateSelectedCanal', {'id': "6584f9d879d896df8071c455",'content':content})
  }

  createProgramaDeTv(content){
    return this.http.post('/mongodb/api/createProgramaDeTv', {'content':content})
  }

  deleteProgramaDeTv(content){
    return this.http.post('/mongodb/api/deleteProgramaDeTv', {'content':content})
  }

  updateVideo(id,content){
    return this.http.post('/mongodb/api/update'+content.tipo, {'id':id,'content':content})
  }

  updateMany(arquivosIds,content,tipo){
    return this.http.post('/mongodb/api/updateMany'+tipo,
            {'arquivosIds':arquivosIds,'content':content})
  }

  createVideo(videoCollection,content){
    return this.http.post('/mongodb/api/create'+videoCollection, {'content':content})
  }

}
