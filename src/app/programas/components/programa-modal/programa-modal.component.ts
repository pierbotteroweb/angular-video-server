import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-programa-modal',
  templateUrl: './programa-modal.component.html',
  styleUrls: ['./programa-modal.component.scss']
})
export class ProgramaModalComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  fechar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
