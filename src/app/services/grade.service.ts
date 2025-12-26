import { Injectable } from '@angular/core';
import { Bloco, DiaDaSemana, DiaDaSemanaProgramaMontado, Emissora, Programa } from '../grade/types/types';
import { MongodbService } from './mongodb.service';
import { take, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { sts } from 'shuffle-tv-services/lib'
import { GradeDataService } from './grade-data.service';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  constructor(
    private mongodbService: MongodbService,
    private gradeData: GradeDataService
  ) { }
  
  destroy$ = new Subject()

  getListaDeProgramasDeTvFromMongodb(selectedCanal:Emissora){
    this.mongodbService.getListaDeProgramasPorCanalDeTv(selectedCanal)
    .pipe(take(1))
    .subscribe((lista:Programa[])=>{
      this.gradeData.setListaDeProgramasDoCanal(lista)
    })
  }
  
  populateListasDeDiasDaSemana(listaDeNomesDosDiasDaSemanaSemProgramaMontado):DiaDaSemana[]{
    return  [
      ...listaDeNomesDosDiasDaSemanaSemProgramaMontado,
      ...listaDeNomesDosDiasDaSemanaSemProgramaMontado.map(
        (diaDaSemana:DiaDaSemana)=>
          `${diaDaSemana}ProgramaMontado` as DiaDaSemanaProgramaMontado)]
  }
    
  montaLista = (listaDeProgramasFiltrada)=>{
    let videoSendoAdicionado

    let prog:Programa = this.gradeData.getSelectedProgramaDeTv()
    
    if(!this.gradeData.getPrePosAvailable()&&prog.anexos&&prog.anexos.prePos){
      this.gradeData.setPrePosApi(prog.anexos.prePos)
      this.gradeData.setPrePosAvailable(true)
      this.gradeData.setPrePosCount(2)
    }

    videoSendoAdicionado = listaDeProgramasFiltrada[0]

      let newProg:Bloco
      let newProgList:Bloco[]=[]

      if(videoSendoAdicionado.cortesParaIntervalo.length){
        let cortes:number[] = videoSendoAdicionado.cortesParaIntervalo
        this.gradeData.setIntervalosCount(cortes.length)
        this.gradeData.setQtdeIntervalos(cortes.length)
        let progModel:Bloco = {
          "atracao":this.gradeData.getSelectedProgramaDeTv().value,
          "tituloAtracao":videoSendoAdicionado.tituloAtracao,
          "titulo":videoSendoAdicionado.titulo,
          "volume":videoSendoAdicionado.volume?videoSendoAdicionado.volume:1,
          "duracaoTotalDaAtracaoEmSegundos":0,
          "horarioDeExibicao":"",
          "id":videoSendoAdicionado._id,
          "idProgMontado":this.gradeData.getIdProgMontado(),
          "tipo":videoSendoAdicionado.tipo
        }

        let inicio = 0
        if(videoSendoAdicionado.corteInicio){
          inicio=videoSendoAdicionado.corteInicio
        }

        let final = cortes[0]

        progModel['inicio']=inicio
        progModel['final']=final
        newProgList.push(progModel)

        cortes.map((corte,index)=>{
          let prog:Bloco =  {
            "atracao":this.gradeData.getSelectedProgramaDeTv().value,
            "tituloAtracao":videoSendoAdicionado.tituloAtracao,
            "titulo":videoSendoAdicionado.titulo,
            "volume":videoSendoAdicionado.volume?videoSendoAdicionado.volume:1,
            "duracaoTotalDaAtracaoEmSegundos":0,
            "horarioDeExibicao":"",
            "id":videoSendoAdicionado._id,
            "idProgMontado":this.gradeData.getIdProgMontado(),
            "tipo":videoSendoAdicionado.tipo
          }
          
          if(index<cortes.length-1) {
            prog['inicio']=cortes[index]
            prog['final']=cortes[index+1]
            prog['duracaoTotalDaAtracaoEmSegundos']=cortes[index+1]-cortes[index]
            newProgList.push(prog)
          } else {
            let finalDoCorte = videoSendoAdicionado.corteFinal?videoSendoAdicionado.corteFinal:videoSendoAdicionado.duracao
            prog['inicio']=cortes[index]
            prog['final']=finalDoCorte
            prog['duracaoTotalDaAtracaoEmSegundos']=finalDoCorte-cortes[index]
            newProgList.push(prog)
          }
        })
      } else {
        newProg = {
          "atracao":this.gradeData.getSelectedProgramaDeTv().value,
          "tituloAtracao":videoSendoAdicionado.tituloAtracao,
          "titulo":videoSendoAdicionado.titulo,
          "volume":videoSendoAdicionado.volume?videoSendoAdicionado.volume:1,
          "horarioDeExibicao":"",
          "duracaoTotalDaAtracaoEmSegundos": videoSendoAdicionado.duracao,
          "id":videoSendoAdicionado._id,
          "idProgMontado":this.gradeData.getIdProgMontado(),
          "tipo":videoSendoAdicionado.tipo
        }

        if(videoSendoAdicionado.corteFinal){
          let corteFinal = videoSendoAdicionado.corteFinal
          newProg['corteFinal']=corteFinal
          newProg['duracaoTotalDaAtracaoEmSegundos']=corteFinal
        }

        if(videoSendoAdicionado.corteInicio){
          let corteInicio = videoSendoAdicionado.corteInicio
          let duracao = videoSendoAdicionado.corteInicio
          newProg['corteInicio']=duracao-corteInicio
        }
      }

      let listInProcess:Bloco[] = this.gradeData.getEmProcessoDeUpdate() ? this.gradeData.getListaParaUpdate() : this.gradeData.getListaCanal()[this.gradeData.getSelectedDiaDaSemana()]
      videoSendoAdicionado.added=true
      this.updateArquivoOnMongoDB(videoSendoAdicionado)        

      this.gradeData.setIndexToAdd(this.gradeData.getBlocoClicado() ? this.gradeData.getBlocoClicado().indice+1 : listInProcess.length)
      let novaListaCanal:Bloco[]

      if(newProgList.length>0){
        novaListaCanal = [...listInProcess.slice(0,this.gradeData.getIndexToAdd()),
                    ...newProgList,...listInProcess.slice(this.gradeData.getIndexToAdd())]
      } else {
        novaListaCanal = [...listInProcess.slice(0,this.gradeData.getIndexToAdd()),
                    newProg,...listInProcess.slice(this.gradeData.getIndexToAdd())]
      }
      if(!this.gradeData.getIntervalosCount()
          &&!this.gradeData.getPrePosCount()){

        this.clearInfoBloco()
      }

      return novaListaCanal
  }
  
  updateArquivoOnMongoDB(arquivo):void {
    this.mongodbService.updateVideo(arquivo._id,arquivo)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      if(!arquivo.added){
        // let currentListaParaDesuso = this.gradeData.getListaParaDesuso()
        // this.gradeData.setListaParaDesuso(currentListaParaDesuso[arquivo.tipo].push(arquivo.id))
      }
    });
  }

  clearInfoBloco(){
    this.gradeData.setBlocoClicado(null)
  }

}
