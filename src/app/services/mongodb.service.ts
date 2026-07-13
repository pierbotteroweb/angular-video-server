import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MongodbService {  

  constructor(private http: HttpClient) { }

  getSeletorDeCanal(){
    return this.http.get('http://thisisshuffletv:9091/api/getSelectedCanal')
  }

  getCanais(){
    return this.http.get('http://thisisshuffletv:9091/api/getCanais')
  }

  getGrade(canal,diaDaSemana){
    return this.http.post('http://thisisshuffletv:9091/api/getGrade', {'canal': canal,'diaDaSemana': diaDaSemana,})
  }

  getProgramasDeTv(tipo,programaDeTv){
    return this.http.post('http://thisisshuffletv:9091/api/'+tipo, {"programaDeTv":programaDeTv})
  }

  getListaDeProgramasDeTv(){
    return this.http.get('http://thisisshuffletv:9091/api/getListaDeProgramasDeTv')
  }

  getListaDeProgramasPorCanalDeTv(canal){
    return this.http.post('http://thisisshuffletv:9091/api/getListaDeProgramasPorCanalDeTv',{"canal":canal})
  }

  getProgramaDeTvById(id){
    return this.http.post('http://thisisshuffletv:9091/api/findProgramaById', {'id': id})
  }

  getFromVideoCollection(videoCollection){
    return this.http.get('http://thisisshuffletv:9091/api/'+videoCollection)
  }

  getFromVideoCollectionById(videoCollection,id){
    return this.http.post('http://thisisshuffletv:9091/api/getVideoById/'+videoCollection.replace("Filmes",""), {'id': id})
  }

  deleteFromVideoCollection(videoCollection,videoId){
    return this.http.post('http://thisisshuffletv:9091/api/delete'+videoCollection, {'id': videoId})
  }

  updateProgramaDeTv(content){
    return this.http.post('http://thisisshuffletv:9091/api/updateProgramaDeTv', {'id': content._id,'content':content})
  }

  updateCanais(content){
    console.log(content._id)
    return this.http.post('http://thisisshuffletv:9091/api/updateCanais', {'id': content._id,'content':content})
  }

  updateSeletorDeCanal(content){
    console.log("Running updateSeletorDeCanal",content)
    return this.http.post('http://thisisshuffletv:9091/api/updateSelectedCanal', {'id': "6584f9d879d896df8071c455",'content':content})
  }

  createProgramaDeTv(content){
    return this.http.post('http://thisisshuffletv:9091/api/createProgramaDeTv', {'content':content})
  }

  deleteProgramaDeTv(content){
    return this.http.post('http://thisisshuffletv:9091/api/deleteProgramaDeTv', {'content':content})
  }

  updateVideo(id,content){
    return this.http.post('http://thisisshuffletv:9091/api/update'+content.tipo, {'id':id,'content':content})
  }

  updateMany(arquivosIds,content,tipo){
    return this.http.post('http://thisisshuffletv:9091/api/updateMany'+tipo,
            {'arquivosIds':arquivosIds,'content':content})
  }

  createVideo(videoCollection,content){
    return this.http.post('http://thisisshuffletv:9091/api/create'+videoCollection, {'content':content})
  }

}
