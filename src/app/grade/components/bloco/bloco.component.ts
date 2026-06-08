import { Component, Input, OnInit } from '@angular/core';
import { Bloco } from '../../types/types';

@Component({
  selector: 'app-bloco',
  templateUrl: './bloco.component.html',
  styleUrls: ['./bloco.component.scss']
})
export class BlocoComponent {

  constructor() { }

  @Input() bloco:Bloco
  @Input() blocoIsSelected:boolean

}
