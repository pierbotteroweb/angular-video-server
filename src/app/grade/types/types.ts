export interface Canal {
    canal: number,
    emissora: Emissora,
    _id: string,
    segunda: Bloco[],
    terca: Bloco[],
    quarta: Bloco[],
    quinta: Bloco[],
    sexta: Bloco[],
    sabado: Bloco[],
    domingo: Bloco[],
    segundaProgramaMontado: ProgramaMontado[],
    tercaProgramaMontado: ProgramaMontado[],
    quartaProgramaMontado: ProgramaMontado[],
    quintaProgramaMontado: ProgramaMontado[],
    sextaProgramaMontado: ProgramaMontado[],
    sabadoProgramaMontado: ProgramaMontado[],
    domingoProgramaMontado: ProgramaMontado[],
}

export interface Arquivo {
    added: boolean,
    canal: Emissora,
    corteFinal: number,
    corteInicio: number,
    cortesParaIntervalo: number[],
    duracao: number,
    emUso: boolean,
    volume?: number,
    order: number,
    programaDeTv: string,
    tipo: TipoDePrograma,
    titulo: string,
    tituloAtracao: string,
    _id: string,
}

export interface BlocoBase {
    atracao: string,
    tituloAtracao: string,
    titulo: string,
    volume: number,
    horarioDeExibicao: string,
    duracaoTotalDaAtracaoEmSegundos: number,
    id: string,
    idProgMontado: string,
    tipo: TipoDePrograma,
}

export interface BlocoUI {
    inicio?:number,
    final?:number,
    indice?:number,
    added?:false,
    dia?:DiaDaSemana
}

export type Bloco = BlocoBase & Partial<BlocoUI>;

export interface ProgramaMontado {
    atracao: string,
    idProgMontado: string,
    horarioDeExibicao: string,
    arquivo: string,
    blocos: Bloco[],
    tituloAtracao: string,
    tempoTotalEmSegundos: number,
    indice?:number,
    dia?:DiaDaSemana,
    tempoTotal: string,
}

export interface ProgramasPorBloco {
    bloco1?:number,
    bloco2?:number,
    bloco3?:number,
    bloco4?:number,
    bloco5?:number,
    bloco6?:number,
}

export interface Programa {
    titulo: string,
    prePos?: boolean,
    tipo: TipoDePrograma,
    value: string,
    canal: Emissora,
    anexos: Anexos,

}

export interface Anexos {
    prePos: string,
    intervalo: string,
    blocosAmount: number,
    bloco1?: string[],
    bloco2?: string[],
    bloco3?: string[],
    bloco4?: string[],
    bloco5?: string[],
    bloco6?: string[]
}

export interface InfoIntPrePos {
    intAmount:number,
    intervaloApi?:string,
    prePosApi?:string
}

export interface ListaParaDesuso {
    originais: string[],
    intervalos: string[],
    dublado: string[],
    madrugada: string[],
    noite: string[],
    novelas: string[],
    movies: string[],
}

export type TipoDePrograma = 'originais' | 'intervalos' | 'dublado' | 'madrugada' | 'noite' | 'novelas' | 'movies'
export type Emissora = 'Cultura' | 'Sbt' | 'Globo' | 'Record' | 'Gazeta' | 'Manchete' | 'Bandeirantes' | 'Mtv'
export type DiaDaSemana = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo'
export type DiaDaSemanaProgramaMontado = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo' | 'segundaProgramaMontado' | 'tercaProgramaMontado' | 'quartaProgramaMontado' | 'quintaProgramaMontado' | 'sextaProgramaMontado' | 'sabadoProgramaMontado' | 'domingoProgramaMontado'