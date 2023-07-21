import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { pipe } from "rxjs";
import { filter, map, tap } from "rxjs/operators";


// O OPERADOR CUSTOMIZADO CRIADO FAZ UM FILTRO DOS EVENTOS NECESSÁRIOS
// DURANTE O PROCESSO DE UPLOAD, DE ACORDO COM O TIPO DE EVENTO
export function filterResponse<T>(){
    return pipe(
        filter((event: HttpEvent<T>)=> event.type === HttpEventType.Response),
        map((res: HttpResponse<T>)=> res.body)
    )    
}

// AQUI O OPERADOR É EXECUTADO A CADA EVENDO DE PROGRESSO DE UPLOAD
// EXECUTANDO A CALLBACK FUNCTION DEFINIDA COMO PARAMETRO.
// ESSA CALLBACK FUNCTION VAI SER EXECUTADA USANDO O RETURN COMO 
// PARAMETRO (NO CASO O VALOR DE PROGRESS)
export function uploadProgress<T>(cb: (progress: number)=> void){
    return tap((event: HttpEvent<T>)=>{
        if(event.type===HttpEventType.UploadProgress){
            cb(Math.round((event.loaded*100)/event.total))
        }
    })

}