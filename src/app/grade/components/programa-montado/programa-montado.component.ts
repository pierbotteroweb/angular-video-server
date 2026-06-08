import { Component, Input, OnInit } from '@angular/core';
import { ProgramaMontado } from '../../types/types';

@Component({
  selector: 'app-programa-montado',
  templateUrl: './programa-montado.component.html',
  styleUrls: ['./programa-montado.component.scss']
})
export class ProgramaMontadoComponent implements OnInit {

  constructor() { }
    
    @Input() programaMontado:ProgramaMontado
    @Input() programaMontadoIsSelected:boolean

  ngOnInit(): void {
  }

}
