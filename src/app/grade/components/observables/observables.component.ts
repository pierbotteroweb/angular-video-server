import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject, from, fromEvent, interval, Observable, of, Subject, timer } from 'rxjs';

@Component({
  selector: 'app-observables',
  template: ''
})
export class ObservablesComponent implements OnInit {

  name$: Observable<string>
  numbersList$: Observable<number>
  data$: Observable<string>
  newNumbersList$: Observable<number>
  timer$: Observable<number>
  type$: Observable<KeyboardEvent>;
  counter$: Observable<number>
  behaviorCounter$: Observable<number>

  private counterSubject = new Subject<number>();
  private counterBehaviorSubject = new BehaviorSubject<number>(0);

  constructor(@Inject(DOCUMENT) private document: any) { }

  ngOnInit(): void {
    // this.observableOfExample()
    // this.observableFromExample()
    // this.observableNewExample()
    // this.observableIntervalExample()
    // this.observableTimerExample()
    // this.observableFromEventExample()
    // this.observableSubjectExample()
    this.observableBehaviorSubjectExample()
  }

  observableOfExample(){

    this.name$ = of("Pier")

    this.name$.subscribe(name=>console.log("Observable 'of' Example:",name))

  }

  observableFromExample(){

    this.numbersList$ = from([1,2,3,4,5])

    this.numbersList$.subscribe(list=>console.log("List created with FROM observable",list))
  }

  observableNewExample(){
    this.newNumbersList$ = new Observable<number>(observer =>{
      observer.next(10)
      observer.next(20)
      observer.next(30)
      observer.complete()
    })

    this.newNumbersList$.subscribe(numberOnNext=>console.log("New number added to observable.next(numberOnNext) ",numberOnNext))
    // New number added to observable.next(numberOnNext) 10
    // New number added to observable.next(numberOnNext) 20
    // New number added to observable.next(numberOnNext) 30
  }

  observableIntervalExample(){

    this.timer$ = interval(1000)

    let uns = this.timer$.subscribe(time=>{
      console.log("Interval",time)
      if(time > 3) uns.unsubscribe()
    })

  }

  observableTimerExample(){

    this.timer$ = timer(5000)

    let uns = this.timer$.subscribe(time=>{
      console.log("Timer",time)
      uns.unsubscribe()
    })

  }

  observableFromEventExample(){
    this.type$ = fromEvent<KeyboardEvent>(document,'keydown');
    this.type$.subscribe((event)=>console.log(event.code))
  }

  observableSubjectExample(){
    this.counter$ = this.counterSubject.asObservable()
    this.counter$.subscribe(number=>{
      console.log("Number receiveb by Subject observable",number)
    })
    this.counterSubject.next(1)
    this.counterSubject.next(2)
    this.counterSubject.next(3)
    this.counter$.subscribe(number=>{
      console.log("Number receiveb by Subject observable AFTER set on 'next' ",number ? number : "no number" )
    })
    // NOT EVEN CALLED
  }
    // Number receiveb by Subject observable 1
    // Number receiveb by Subject observable 2
    // Number receiveb by Subject observable 3

  observableBehaviorSubjectExample(){
    this.behaviorCounter$ = this.counterBehaviorSubject.asObservable()
    this.behaviorCounter$.subscribe(number=>{
      console.log("Number receiveb by Behavior Subject observable",number)
    })
    this.counterBehaviorSubject.next(1)
    this.counterBehaviorSubject.next(2)
    this.counterBehaviorSubject.next(3)
    this.behaviorCounter$.subscribe(number=>{
      console.log("Number receiveb by Behavior Subject observable AFTER set on 'next' ",number ? number : "no number" )
    })
    this.behaviorCounter$.subscribe(number=>{
      console.log("Number receiveb by Behavior Subject observable AFTER set on 'next' called on more time",number ? number : "no number" )
    })
  }
    // Number receiveb by Behavior Subject observable 0 <== initial value set on declaration
    // Number receiveb by Behavior Subject observable 1
    // Number receiveb by Behavior Subject observable 2
    // Number receiveb by Behavior Subject observable 3
    // Number receiveb by Behavior Subject observable AFTER set on 'next'  3
    // Number receiveb by Behavior Subject observable AFTER set on 'next' called on more time 3

}
