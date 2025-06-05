import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-mobile-remote',
  templateUrl: './mobile-remote.component.html',
  styleUrls: ['./mobile-remote.component.scss']
})
export class MobileRemoteComponent {
  @Input() selectedCanal: number;
  @Input() listaDeNumerosDeCanais: Array<any>;
  @Output() channelChange = new EventEmitter<number>();
  @Output() directionChange = new EventEmitter<string>();

  changeChannel(channel: number) {
    this.channelChange.emit(channel);
  }

  zapchannel(direction: string) {
    this.directionChange.emit(direction);
  }
} 