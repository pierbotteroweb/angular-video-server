import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MongodbService } from 'src/app/services/mongodb.service';

@Component({
  selector: 'app-sidebars',
  templateUrl: './sidebars.component.html',
  styleUrls: ['./sidebars.component.scss']
})
export class SidebarsComponent {

  constructor(
    private firebaseService: FirebaseService,
    private mongodbService: MongodbService) { }
  @Input() viewport
  @Input() arrayNumerosCanais
  @Input() selectedCanal
  @Output() switchEventChannel = new EventEmitter<string>();
  
  zapchannel(direction){

    let indexListaDeCanais = this.arrayNumerosCanais.indexOf(this.selectedCanal.toString())
    if(direction=="up"){
      if(indexListaDeCanais==(this.arrayNumerosCanais.length-1)){
        this.selectedCanal=this.arrayNumerosCanais[0]
      } else {
        indexListaDeCanais++
        this.selectedCanal = this.arrayNumerosCanais[indexListaDeCanais]
      }
    } else if(direction=="down"){
      if(indexListaDeCanais==0){
        this.selectedCanal=this.arrayNumerosCanais[this.arrayNumerosCanais.length-1]
      } else {
        indexListaDeCanais--
        this.selectedCanal = this.arrayNumerosCanais[indexListaDeCanais]
      }
    }
    this.switchEventChannel.emit(this.selectedCanal)
  }

  changeChannel(channel){
    this.selectedCanal=channel
    this.firebaseService.updateSeletorDeCanal({canal:channel})
    this.mongodbService.updateSeletorDeCanal({canal:channel}).subscribe(() => {
      console.log('Selected Canal updated successfully!');
    })
  }

}
