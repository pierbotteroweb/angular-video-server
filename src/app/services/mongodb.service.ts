import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MongodbService {  

  constructor(private http: HttpClient) { }

  getCanais(){
    return this.http.get('http://shuffletv.ddns.net:9000/api/getCanais')
  }

  getProgramasDeTv(tipo,programaDeTv){
    return this.http.post('http://shuffletv.ddns.net:9000/api/'+tipo, {"programaDeTv":programaDeTv})
  }

  getListaDeProgramasDeTv(){
    return this.http.get('http://shuffletv.ddns.net:9000/api/getListaDeProgramasDeTv')
  }

  getProgramaDeTvById(id){
    return this.http.post('http://shuffletv.ddns.net:9000/api/findProgramaById', {'id': id})
  }

  getFromVideoCollection(videoCollection){
    return this.http.get('http://shuffletv.ddns.net:9000/api/'+videoCollection)
  }

  deleteFromVideoCollection(videoCollection,videoId){
    return this.http.post('http://shuffletv.ddns.net:9000/api/delete'+videoCollection, {'id': videoId})
  }

  updateProgramaDeTv(content){
    return this.http.post('http://shuffletv.ddns.net:9000/api/updateProgramaDeTv', {'id': content._id,'content':content})
  }

  updateCanais(content){
    console.log(content._id)
    return this.http.post('http://shuffletv.ddns.net:9000/api/updateCanais', {'id': content._id,'content':content})
  }

  createProgramaDeTv(content){
    return this.http.post('http://shuffletv.ddns.net:9000/api/createProgramaDeTv', {'content':content})
  }

  updateVideo(id,content){
    return this.http.post('http://shuffletv.ddns.net:9000/api/update'+content.tipo, {'id':id,'content':content})
  }

  createVideo(videoCollection,content){
    return this.http.post('http://shuffletv.ddns.net:9000/api/create'+videoCollection, {'content':content})
  }

}
