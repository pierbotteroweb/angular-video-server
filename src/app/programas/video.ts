export interface VideoModel {
    order: unknown;
    value: any;
    id: string;
    titulo: string;
    programaDeTv?: string;
    duracao:number;
    tipo?:string;
    sub:boolean
    // cortes?: Array<number>;
    // horario?: string;
    // canal?: string;
    // url: string;
    // programaDeTv?: Array<string>;
    // selected: boolean;
  }
  