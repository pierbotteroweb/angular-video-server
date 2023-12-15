import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { take } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PontoDePartidaService {

  // private readonly API:any= 'http://shuffletv.ddns.net:2099/data'
  private readonly API:any= 'http://shuffletv.ddns.net:9000/api'

  constructor(private http: HttpClient) { }

  getPontoDePartida(){
    return this.http.get<any>(this.API+"/getPontoDePartida")
  }

  updatePontoDePartida(content:any){
    return this.http.post(this.API+"/updatePontoDePartida",{'content':content})
  }

  // setPontoDePartida(dados:any){
  //   return this.http.put(this.API+"/0",dados).pipe(take(1))
  // }
  
  
  
  getIPAddress()
  {
    return this.http.get("http://api.ipify.org/?format=json")
  }
}
