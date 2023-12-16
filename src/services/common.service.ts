import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  toSeconds(tempo) {
    let tempoEmSegundos =
      parseInt(tempo.split(":")[0])
      * 3600 + parseInt(tempo.split(":")[1])
      * 60 + parseInt(tempo.split(":")[2])
    return tempoEmSegundos
  }

  toTime(tempo) {
    return tempo ? new Date(tempo * 1000).toISOString().substr(11, 8) : 0
  }

  updatePageTitle(text) {
    document.getElementsByTagName('title')[0]
      .innerText = "Shuffle TV - " + text.split(".")[0]
        .replace("Dublado - ", "")
  }

  sortPorTitulo() {
    return (a,b)=>{
      if (a.titulo < b.titulo) { return -1; }
      if (a.titulo > b.titulo) { return 1;  }
      return 0;
    }
  }

  sortPor(objKey) {
    return (a, b) => parseFloat(a[objKey]) - parseFloat(b[objKey])
  }
  
  camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  toTitleCase(text){
    let letter = text.split("")[0]
    let ext = text.slice(1)
    return letter.toLocaleUpperCase()+ext    
  }

  orderObjectKeys(obj){
    return Object.keys(obj)
    .sort()
    .reduce((acc, key) => ({
        ...acc, [key]: obj[key]
    }), {})
  }

  removeFromString = (list,text:any)=>{
    let newText = text
    list.map(item=>{
        newText = newText.replace(item,"")
    })
    return newText
  }

}

