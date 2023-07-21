import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[mousevolume]'
})
export class MousevolumeDirective {
  i:number=1;
     constructor(){}
     vol:any=1
 
     @HostListener('mousewheel', ['$event']) onMousewheel(event) {
      if(event.wheelDelta>0&&this.vol<=0.99){
        this.vol+=0.1
      } else if(event.wheelDelta<0&&this.vol>=0.01){
        this.vol-=0.1
      }
      event.target.volume= this.vol
     }
}
