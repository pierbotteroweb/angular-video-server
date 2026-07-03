import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ProgramaModel } from '../../programa';

type TipoAnexo = 'prePos' | 'intervalo';

interface ProgramaModalState {
  intervalo: string;
  prePos: string;
  blocos: {
    [key: string]: string[];
  };
}

@Component({
  selector: 'app-programa-modal',
  templateUrl: './programa-modal.component.html',
  styleUrls: ['./programa-modal.component.scss']
})
export class ProgramaModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() programa: ProgramaModel | null = null;
  @Input() programas: ProgramaModel[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() salvarPrograma = new EventEmitter<any>();
  blocos = [1, 2, 3, 4, 5, 6];
  dropdownsPorBloco = [1, 2, 3];

  estadoInicial: ProgramaModalState = this.getEstadoVazio();
  estadoAtual: ProgramaModalState = this.getEstadoVazio();

  private tiposPermitidosParaBlocos = ['dublado', 'originais'];
  private tipoPermitidoParaIntervalos = 'intervalos';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.programa || (changes.visible && changes.visible.currentValue)) {
      this.inicializarEstadoDoModal();
    }
  }

  get temAlteracoes(): boolean {
    return JSON.stringify(this.estadoAtual) !== JSON.stringify(this.estadoInicial);
  }

  get programasParaDropdownsDeBlocos(): ProgramaModel[] {
    const programaSelecionado = this.programa;

    if (!programaSelecionado) {
      return [];
    }

    return this.programas.filter(programa => {
      return programa.canal === programaSelecionado.canal &&
        this.tiposPermitidosParaBlocos.indexOf(programa.tipo) >= 0;
    });
  }

  get programasParaDropdownsDeIntervalos(): ProgramaModel[] {
    const programaSelecionado = this.programa;

    if (!programaSelecionado) {
      return [];
    }

    return this.programas.filter(programa => {
      return programa.canal === programaSelecionado.canal &&
        programa.tipo === this.tipoPermitidoParaIntervalos;
    });
  }

  getValorAnexo(tipo: TipoAnexo): string {
    return this.estadoAtual[tipo] || '';
  }

  getProgramasParaDropdownDeAnexo(tipo: TipoAnexo): ProgramaModel[] {
    const valorSelecionado = this.getValorAnexo(tipo);
    const programasFiltrados = this.programasParaDropdownsDeIntervalos;

    if (!valorSelecionado) {
      return programasFiltrados;
    }

    const valorSelecionadoEstaNaLista = programasFiltrados.some(programa => {
      return this.isProgramaCorrespondenteAoValor(programa, valorSelecionado);
    });

    if (valorSelecionadoEstaNaLista) {
      return programasFiltrados;
    }

    const programaSelecionado = this.programas.find(programa => {
      return programa.tipo === this.tipoPermitidoParaIntervalos &&
        this.isProgramaCorrespondenteAoValor(programa, valorSelecionado);
    });

    return programaSelecionado ? [programaSelecionado, ...programasFiltrados] : programasFiltrados;
  }

  isProgramaSelecionadoNoAnexo(tipo: TipoAnexo, programa: ProgramaModel): boolean {
    return this.isProgramaCorrespondenteAoValor(
      programa,
      this.getValorAnexo(tipo)
    );
  }

  getValorProgramaDoBloco(bloco: number, dropdown: number): string {
    const programasDoBloco = this.estadoAtual.blocos['bloco' + bloco];

    if (!Array.isArray(programasDoBloco)) {
      return '';
    }

    return programasDoBloco[dropdown - 1] || '';
  }

  onAnexoChange(tipo: TipoAnexo, event: Event): void {
    this.estadoAtual[tipo] = this.getSelectValue(event);
  }

  onBlocoChange(bloco: number, dropdown: number, event: Event): void {
    const blocoKey = 'bloco' + bloco;

    if (!this.estadoAtual.blocos[blocoKey]) {
      this.estadoAtual.blocos[blocoKey] = this.dropdownsPorBloco.map(() => '');
    }

    this.estadoAtual.blocos[blocoKey][dropdown - 1] = this.getSelectValue(event);
  }

  getProgramasParaDropdownDoBloco(bloco: number, dropdown: number): ProgramaModel[] {
    const valorSelecionado = this.getValorProgramaDoBloco(bloco, dropdown);
    const programasFiltrados = this.programasParaDropdownsDeBlocos;

    if (!valorSelecionado) {
      return programasFiltrados;
    }

    const valorSelecionadoEstaNaLista = programasFiltrados.some(programa => {
      return this.isProgramaCorrespondenteAoValor(programa, valorSelecionado);
    });

    if (valorSelecionadoEstaNaLista) {
      return programasFiltrados;
    }

    const programaSelecionado = this.programas.find(programa => {
      return this.isProgramaCorrespondenteAoValor(programa, valorSelecionado);
    });

    return programaSelecionado ? [programaSelecionado, ...programasFiltrados] : programasFiltrados;
  }

  isProgramaSelecionadoNoBloco(bloco: number, dropdown: number, programa: ProgramaModel): boolean {
    return this.isProgramaCorrespondenteAoValor(
      programa,
      this.getValorProgramaDoBloco(bloco, dropdown)
    );
  }

  private isProgramaCorrespondenteAoValor(programa: ProgramaModel, valor: string): boolean {
    if (!valor) {
      return false;
    }

    return programa.value === valor || programa._id === valor;
  }

  getTituloAnexo(tipo: TipoAnexo): string {
    const value = this.getValorAnexo(tipo);

    if (!value) {
      return '-';
    }

    const programaEncontrado = this.programas.find(programa => programa.value === value);

    return programaEncontrado ? programaEncontrado.titulo : value;
  }

  salvar(): void {
    if (!this.temAlteracoes) {
      return;
    }

    this.salvarPrograma.emit({
      programa: this.programa,
      anexos: this.getAnexosAtualizados()
    });

    this.estadoInicial = this.cloneEstado(this.estadoAtual);
  }

  fechar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private inicializarEstadoDoModal(): void {
    const estado = this.getEstadoFromPrograma();
    this.estadoInicial = this.cloneEstado(estado);
    this.estadoAtual = this.cloneEstado(estado);
  }

  private getEstadoFromPrograma(): ProgramaModalState {
    const anexos = this.programa && this.programa.anexos as any || {};
    const estado = this.getEstadoVazio();

    estado.intervalo = anexos.intervalo || '';
    estado.prePos = anexos.prePos || '';

    this.blocos.forEach(bloco => {
      const blocoKey = 'bloco' + bloco;
      const programasDoBloco = Array.isArray(anexos[blocoKey]) ? anexos[blocoKey] : [];

      estado.blocos[blocoKey] = this.dropdownsPorBloco.map((_, index) => {
        return programasDoBloco[index] || '';
      });
    });

    return estado;
  }

  private getEstadoVazio(): ProgramaModalState {
    const estado: ProgramaModalState = {
      intervalo: '',
      prePos: '',
      blocos: {}
    };

    this.blocos.forEach(bloco => {
      estado.blocos['bloco' + bloco] = this.dropdownsPorBloco.map(() => '');
    });

    return estado;
  }

  private getAnexosAtualizados(): any {
    const anexos = this.programa && this.programa.anexos ? { ...(this.programa.anexos as any) } : {};

    anexos.intervalo = this.estadoAtual.intervalo;
    anexos.prePos = this.estadoAtual.prePos;

    this.blocos.forEach(bloco => {
      const blocoKey = 'bloco' + bloco;
      anexos[blocoKey] = [...this.estadoAtual.blocos[blocoKey]];
    });

    return anexos;
  }

  private cloneEstado(estado: ProgramaModalState): ProgramaModalState {
    return JSON.parse(JSON.stringify(estado));
  }

  private getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
