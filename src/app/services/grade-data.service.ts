import { Injectable } from '@angular/core';
import { Bloco, DiaDaSemana, DiaDaSemanaProgramaMontado, Emissora, ListaParaDesuso, Programa } from '../grade/types/types';
import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { sts } from 'shuffle-tv-services/lib'

@Injectable({
  providedIn: 'root'
})
export class GradeDataService {

  constructor() { }

    // LISTA DE PROGRAMAS DE TV DE UM CANAL ESPECIFICO
    // PROGRAMA: TELA QUENTE (CANAL GLOBO)
    private listaDeProgramasDoCanal = new BehaviorSubject<Programa[]>([])
    
    listaDeProgramasDoCanal$ = this.listaDeProgramasDoCanal.asObservable()
  
    setListaDeProgramasDoCanal(lista:Programa[]):void{
      this.listaDeProgramasDoCanal.next(lista)
    }
  
    // DIA DA SEMANA SELECIONADO NA GRADE (EX: SEGUNDA)
    private selectedDiaDaSemana = new BehaviorSubject<DiaDaSemana>("segunda")
  
    selectedDiaDaSemana$ = this.selectedDiaDaSemana.asObservable()
  
    setSelectedDiaDaSemana(dia:DiaDaSemana):void{
      this.selectedDiaDaSemana.next(dia)
    }
  
    getSelectedDiaDaSemana():DiaDaSemana{
      return this.selectedDiaDaSemana.getValue()
    }
  
    // PROGRAMA SELECIONADO NA GRADE (EX: TELA QUENTE)
    private selectedProgramaDeTv = new BehaviorSubject<Programa>(null)
  
    selectedProgramaDeTv$ = this.selectedProgramaDeTv.asObservable()
  
    setSelectedProgramaDeTv(programa:Programa):void{
      this.selectedProgramaDeTv.next(programa)
    }
  
    getSelectedProgramaDeTv():Programa{
      return this.selectedProgramaDeTv.getValue()
    }
  
    // INFORMA SE PROGRAMA SELECIONADO TEM PREPOS
    private prePosAvailable = new BehaviorSubject<boolean>(false)
  
    prePosAvailable$ = this.prePosAvailable.asObservable()
  
    setPrePosAvailable(status:boolean):void{
      this.prePosAvailable.next(status)
    }
  
    getPrePosAvailable():boolean{
      return this.prePosAvailable.getValue()
    }
  
    // INFORMA SE PROGRAMA STRING DE REFERENCIA DO PREPOS
    private prePosApi = new BehaviorSubject<string>("")
  
    prePosApi$ = this.prePosApi.asObservable()
  
    setPrePosApi(api:string):void{
      this.prePosApi.next(api)
    }
  
    getPrePosApi():string{
      return this.prePosApi.getValue()
    }
  
    // INFORMA CONTAGEM USADA DE PREPOS APIS A SEREM PROCESSADOS
    private prePosCount = new BehaviorSubject<number>(0)
  
    prePosCount$ = this.prePosCount.asObservable()
  
    setPrePosCount(count:number):void{
      this.prePosCount.next(count)
    }

    increasePrePosCount():void{
      let count:number = this.prePosCount.getValue()
      this.setPrePosCount(count + 1)
    }

    decreasePrePosCount():void{
      let count:number = this.prePosCount.getValue()
      this.setPrePosCount(count - 1)
    }
  
    getPrePosCount():number{
      return this.prePosCount.getValue()
    }
  
    // INFORMA CONTAGEM USADA DE INTERVALOS APIS A SEREM PROCESSADOS
    private intervalosCount = new BehaviorSubject<number>(0)
  
    intervalosCount$ = this.intervalosCount.asObservable()
  
    setIntervalosCount(api:number):void{
      this.intervalosCount.next(api)
    }

    increaseIntervalosCount():void{
      let count:number = this.intervalosCount.getValue()
      this.setIntervalosCount(count + 1)
    }

    decreaseIntervalosCount():void{
      let count:number = this.intervalosCount.getValue()
      this.setIntervalosCount(Math.max(0, count - 1))
    }
  
    getIntervalosCount():number{
      return this.intervalosCount.getValue()
    }
  
  
    // INFORMA ID CRIADA PARA PROGRAMA A SER MONTADO
    private idProgMontado = new BehaviorSubject<string>("")
  
    idProgMontado$ = this.idProgMontado.asObservable()
  
    setIdProgMontado(id:string):void{
      this.idProgMontado.next(id)
    }
  
    getIdProgMontado():string{
      return this.idProgMontado.getValue()
    }
  
    // INFORMA QUANTIDADE DE INTERVALOS USADA NOS CALCULOS
    private qtdeIntervalos = new BehaviorSubject<number>(0)
  
    qtdeIntervalos$ = this.qtdeIntervalos.asObservable()
  
    setQtdeIntervalos(api:number):void{
      this.qtdeIntervalos.next(api)
    }
  
    getQtdeIntervalos():number{
      return this.qtdeIntervalos.getValue()
    }
  
    // INFORMA SE A LISTA ESTA SENDO MONTADA
    // EM UM PROCESSO DE UPDATE
    private emProcessoDeUpdate = new BehaviorSubject<boolean>(false)
  
    emProcessoDeUpdate$ = this.emProcessoDeUpdate.asObservable()
  
    setEmProcessoDeUpdate(status:boolean):void{
      this.emProcessoDeUpdate.next(status)
    }
  
    getEmProcessoDeUpdate():boolean{
      return this.emProcessoDeUpdate.getValue()
    }
  
    // LISTA DE BLOCOS USADAS PARA O PROCESSO DE UPDATE
    private listaParaUpdate = new BehaviorSubject<Bloco[]>(null)
  
    listaParaUpdate$ = this.listaParaUpdate.asObservable()
  
    setListaParaUpdate(lista:Bloco[]):void{
      this.listaParaUpdate.next(lista)
    }
  
    getListaParaUpdate():Bloco[]{
      return this.listaParaUpdate.getValue()
    }
  
    // LISTA DE BLOCOS DE UM CANAL ESPECIFICO
    private listaCanal = new BehaviorSubject<Bloco[]>(null)
  
    listaCanal$ = this.listaCanal.asObservable()
  
    setListaCanal(lista:Bloco[]):void{
      this.listaCanal.next(lista)
    }
  
    getListaCanal():Bloco[]{
      return this.listaCanal.getValue()
    }
  
    // INFORMA INDICE DA LISTA SENDO MONTADA
    // ONDE BLOCO PRECISA SER ENCAIXADO
    private indexToAdd = new BehaviorSubject<number>(0)
  
    indexToAdd$ = this.indexToAdd.asObservable()
  
    setIndexToAdd(index:number):void{
      this.indexToAdd.next(index)
    }
  
    getIndexToAdd():number{
      return this.indexToAdd.getValue()
    }
  
    // INFORMA DADOS DE UM BLOCO CLICADO
    // COM INFORMACOES SENDO VISUALIZADAS NO TEMPLATE
    private blocoClicado = new BehaviorSubject<Bloco>(null)
  
    blocoClicado$ = this.blocoClicado.asObservable()
  
    setBlocoClicado(bloco:Bloco | null ):void{
      this.blocoClicado.next(bloco)
    }
  
    getBlocoClicado():Bloco | null {
      return this.blocoClicado.getValue()
    }

  
    // OBJETO COM LISTAS DE ARQUIVOS DE CADA
    // CATEGORIA QUE PRECISAM SER SETADOS COMO
    // EM USO FALSE APOS UMA LISTA SER SALVA
    private listaParaDesuso = new BehaviorSubject<ListaParaDesuso>({
        "dublado":[],
        "intervalos":[],
        "originais":[],
        "noite":[],
        "madrugada":[],
        "novelas":[],
        "movies":[],
      })
  
    listaParaDesuso$ = this.listaParaDesuso.asObservable()
  
    setListaParaDesuso(lista:ListaParaDesuso):void{
      this.listaParaDesuso.next(lista)
    }
  
    getListaParaDesuso():ListaParaDesuso{
      return this.listaParaDesuso.getValue()
    }
}
