export interface VideoModel {
    id: string;
    titulo: string;
    programaDeTv?: string;
    duracao:number;
    tipo?:string;
    order?:number;
    sub:boolean
    // cortes?: Array<number>;
    // horario?: string;
    // canal?: string;
    // url: string;
    // programaDeTv?: Array<string>;
    // selected: boolean;
  }
  