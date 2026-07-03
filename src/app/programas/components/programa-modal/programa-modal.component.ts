import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProgramaModel } from '../../programa';

@Component({
  selector: 'app-programa-modal',
  templateUrl: './programa-modal.component.html',
  styleUrls: ['./programa-modal.component.scss']
})
export class ProgramaModalComponent {
  @Input() visible = false;
  @Input() programa: ProgramaModel | null = null;
  @Input() programas: ProgramaModel[] = [];
  @Output() visibleChange = new EventEmitter<boolean>();
  blocos = [1, 2, 3, 4, 5, 6];
  dropdownsPorBloco = [1, 2, 3];

  private tiposPermitidosParaBlocos = ['dublado', 'originais'];
  private tipoPermitidoParaIntervalos = 'intervalos';

  get programasParaDropdownsDeBlocos(): ProgramaModel[] {
    if (!this.programa) {
      return [];
    }

    return this.programas.filter(programa => {
      return programa.canal === this.programa.canal &&
        this.tiposPermitidosParaBlocos.indexOf(programa.tipo) >= 0;
    });
  }

  get programasParaDropdownsDeIntervalos(): ProgramaModel[] {
    if (!this.programa) {
      return [];
    }

    return this.programas.filter(programa => {
      return programa.canal === this.programa.canal &&
        programa.tipo === this.tipoPermitidoParaIntervalos;
    });
  }

  getValorAnexo(tipo: 'prePos' | 'intervalo'): string {
    const anexos = this.programa && this.programa.anexos as any;

    return anexos && anexos[tipo] ? anexos[tipo] : '';
  }

  getProgramasParaDropdownDeAnexo(tipo: 'prePos' | 'intervalo'): ProgramaModel[] {
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

  isProgramaSelecionadoNoAnexo(tipo: 'prePos' | 'intervalo', programa: ProgramaModel): boolean {
    return this.isProgramaCorrespondenteAoValor(
      programa,
      this.getValorAnexo(tipo)
    );
  }

  getValorProgramaDoBloco(bloco: number, dropdown: number): string {
    const anexos = this.programa && this.programa.anexos as any;
    const programasDoBloco = anexos && anexos['bloco' + bloco];

    if (!Array.isArray(programasDoBloco)) {
      return '';
    }

    return programasDoBloco[dropdown - 1] || '';
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

  getTituloAnexo(tipo: 'prePos' | 'intervalo'): string {
    const value = this.getValorAnexo(tipo);

    if (!value) {
      return '-';
    }

    const programaEncontrado = this.programas.find(programa => programa.value === value);

    return programaEncontrado ? programaEncontrado.titulo : value;
  }

  fechar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
