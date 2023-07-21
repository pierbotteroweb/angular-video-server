import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadVideoService {

  constructor(private http: HttpClient) { }

  upload(files: Set<File>, url: string){
    if(files){


    // Como vamos fazer o envio de arquivos na nossa request,
    // usaremos (em vez de um JSON) o formato "multipart/form-data
    const formData = new FormData()

    // Para cada arquivo no nosso Set, fazemos um 
    // append no formData criado. Este append tem 3 parametros:
    // 1) Nome do atributo (no nosso caso um 'file')
    // 2) O blob (que seri ao arquivo endo enviado) 
    // 3) O nome atribuido ao arquivo enviado.
      files.forEach(file=>{ 
        formData.append('file',file, file.name)
      })

      // const request = new HttpRequest('POST', url, formData)
      // return this.http.request(request)

      // PODERIAMOS USAR O POST DO HTTP DIRETAMENTE, COMO ABAIXO
      return this.http.post(url, formData, {
        // COM PARAMETRO DE OPÇÕES DISPONIVEIS NO HTTP POST, O ANGULAR
        // PODE REPORTAR TODOS EVENTOS HTTP EM ANDAMENTO
        observe: "events",
        // AQUI TEREMOS NO RETORNO O TIPO DE EVENTO EM ANDAMENTO,
        // PRECISAMOS DO EVENTO DE UPLOAD PROGRESS
        // DISPONIVEL APENAS PARA REQUESTS COM UPLOADS E DOWNLOADS.
        reportProgress: true
      })
    }
  }

  idUpdate(url:string,videoId:string){
    return this.http.post(url,{"id":videoId})
  }

  listUpdate(list:Array<any>,url:string){
    return this.http.post(url,{"data":list})
  }

  update(url:string,tipo:string,dado:string,id:string){
    let json={
      "id":id,
      "tipo":tipo,
      "dado":dado
    }
    return this.http.post(url,json)
  }

  download(url: string){
    // POR PADRÃO, O GET DO HTTPCLIENT DO ANGULAR RETORNA
    // UM JSON. POR ISSO PRECISAMOS USAR O PARAMETRO DE OPÇÕES PARA
    // PARA DEFINIR QUE O RETORNO SERÁ UM BLOB 
    return this.http.get(url,{
      responseType: 'blob' as 'json'
      // CASO SE QUEIRA EXIBIR O PROGRESSO DE DOWNLOAD
      // PRECISAMOS RETORNAR TAMBÉM O reportProgress
      // ONDE CONSTAM INFORMAÇÕES NECESSÁRIAS,
      // COMO O content-length
    })    
  }

  handleFile(res: any, fileName: string){
    // A PRIMEIRA ETAPA DA LOGICA EM JS PARA DOWNLAOD DO ARQUIVO
    // É CRIAR UMA INSTANCIA DE UM BLOB. O NOSSO ARQUIVO RECEBE 
    // O CONTEUDO DA RESPONSE
    const file = new Blob([res],{
      type: res.type
    })

    // INICIALMENTE VERIFICAMOS SE ESTAMOS USANDO O INTERNEX EXPLORER
    // E CASO SIM, USAMOS O RECURSO DISPONMIVLE NO IE PARA O DOWNLOAD
    // if(window.navigator && window.navigator.msSaveOrOpenBlob){
    //   window.navigator.msSaveOrOpenBlob(file);
      // AQUI FAZEMOS UM RETURM PARA QUE O RESTO DA FUNÇÃO
      // NÃO SEJA EXECUTADA
    //   return
    //} // CASO NÃO SEJA IE, USAMOS A LOGICA ABAIXO PARA CHROME     


    // COM O NOSSO ARQUIVO PRONTO, PRECISAMOS INSERIR
    // NO NOSSO WINDOW DOCUMENT, O LINK PARA O ARQUIVO:

    // AQUI A URL PARA O DOWNLOAD
    const blob = window.URL.createObjectURL(file) 

    // AQUI O LINK PROPRIAMENTE DITO, QUE VAI SER "CLICADO"
    // VIA JAVASCRIPT
    const link = document.createElement('a')

    // INSERIMOS O HREF NO NOSSO LINK
    link.href = blob
    // PODEMOS TAMBÉM SETAR O NOME DO ARQUIVO QUE
    // ESTÁ SENDO BAIXADO
    link.download = fileName

    // FAZEMOS O LINK VIRTUAL (NÃO FUNCIONA NO FIREFOX)
    link.click()

    // PARA O FIREFOX
    // link.dispatchEvent(new MouseEvent('click',{
    //   bubbles: true,
    //   cancelable: true,
    //   view: window
    // }))

    // LIMPAMOS A URL DO NODDO DOCUMENTO WINDOWS
    // window.URL.revokeObjectURL(blob)

    // E FINALMENTE, LIMPAMOS O NOSSO LINK CRIADO
    // link.remove()

    // NO FIREFOX, É NECESSÁRIO UM PEQUENO DELAY DE 100MS
    // PARA A LIMPERA DA URL E DO LINK
    setTimeout(()=>{
      window.URL.revokeObjectURL(blob)
      link.remove()
    },100)


  }
}
