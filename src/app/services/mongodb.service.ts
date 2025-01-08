import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MongodbService {  

  constructor(private http: HttpClient) { }

  getSeletorDeCanal(){
    return this.http.get('http://thisisshuffletv.zapto.org:9091/api/getSelectedCanal')
  }

  getCanais(){
    return this.http.get('http://thisisshuffletv.zapto.org:9091/api/getCanais')
  }

  getProgramasDeTv(tipo,programaDeTv){
    return this.http.post('http://thisisshuffletv.zapto.org:9091/api/'+tipo, {"programaDeTv":programaDeTv})
  }

  getListaDeProgramasDeTv(){
    return this.http.get('http://thisisshuffletv.zapto.org:9091/api/getListaDeProgramasDeTv')
  }

  getProgramaDeTvById(id){
    return this.http.post('http://thisisshuffletv.zapto.org:9091/api/findProgramaById', {'id': id})
  }

  getFromVideoCollection(videoCollection){
    return this.http.get('http://thisisshuffletv.zapto.org:9091/api/'+videoCollection)
  }

  getFromVideoCollectionById(videoCollection,id){
    return this.http.post('http://thisisshuffletv.zapto.org:9091/api/getVideoById/'+videoCollection.replace("Filmes",""), {'id': id})
  }

  deleteFromVideoCollection(videoCollection,videoId){
    return this.http.post('http://thisisshuffletv.zapto.org:9091/api/delete'+videoCollection, {'id': videoId})
  }

  updateProgramaDeTv(content){
    return this.http.post('http://thisisshuffletv.zapto.org:9091/api/updateProgramaDeTv', {'id': content._id,'content':content})
  }

  updateCanais(content){
    console.log(content._id)
    return this.http.post('http://thisisshuffletv.zapto.org:9091/api/updateCanais', {'id': content._id,'content':content})
  }

  updateSeletorDeCanal(content){
    return this.http.post('http://thisisshuffletv.zapto.org:9091/api/updateSelectedCanal', {'id': "6584f9d879d896df8071c455",'content':content})
  }

  createProgramaDeTv(content){
    return this.http.post('http://thisisshuffletv.zapto.org:9091/api/createProgramaDeTv', {'content':content})
  }

  updateVideo(id,content){
    return this.http.post('http://thisisshuffletv.zapto.org:9091/api/update'+content.tipo, {'id':id,'content':content})
  }

  createVideo(videoCollection,content){
    return this.http.post('http://thisisshuffletv.zapto.org:9091/api/create'+videoCollection, {'content':content})
  }

}
