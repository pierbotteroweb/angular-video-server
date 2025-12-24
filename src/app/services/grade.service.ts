import { Injectable } from '@angular/core';
import { Emissora, Programa } from '../grade/types/types';
import { MongodbService } from './mongodb.service';
import { take } from 'rxjs/operators';
import { sts } from 'shuffle-tv-services/lib'
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  
  listaDeProgramasDoCanal$ = new BehaviorSubject<Programa[]>([])

  constructor(private mongodbService: MongodbService) { }

  getListaDeProgramasDeTvFromMongodb(selectedCanal:Emissora){
    this.mongodbService.getListaDeProgramasPorCanalDeTv(selectedCanal)
    .pipe(take(1))
    .subscribe((lista:Programa[])=>{
      this.listaDeProgramasDoCanal$.next(lista)
    })
  }

}
