export interface Canal {
    canal: number,
    emissora: string,
    _id: string,
    segunda: Bloco,
    terca: Bloco,
    quarta: Bloco,
    quinta: Bloco,
    sexta: Bloco,
    sabado: Bloco,
    domingo: Bloco,
    segundaBloco: Bloco,
    tercaBloco: Bloco,
    quartaBloco: Bloco,
    quintaBloco: Bloco,
    sextaBloco: Bloco,
    sabadoBloco: Bloco,
    domingoBloco: Bloco,
}

export interface Bloco {
    atracao: string,
    tituloAtracao: string,
    titulo: string,
    volume: number,
    horarioDeExibicao: string,
    duracaoTotalDaAtracaoEmSegundos: number,
    id: string,
    idProgTotal: string,
    tipo: TipoDePrograma,
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
export type DiaDaSemanaBloco = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo' | 'segundaBloco' | 'tercaBloco' | 'quartaBloco' | 'quintaBloco' | 'sextaBloco' | 'sabadoBloco' | 'domingoBloco'