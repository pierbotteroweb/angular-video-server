// MODULOS DO ANGULAR
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// AMBIENTE
import { environment } from '../environments/environment';

// MODULSO FIREBASE E PRIMENG
import { TableModule } from 'primeng/table';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';


// COMPONENTS
import { AppComponent } from './app.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { GradeComponent } from './grade/grade.component';
import { ProgramasComponent } from './programas/programas.component';

// // MODULO COMPARTILHADO
// import { SharedComponentsModule } from './shared/shared-components/shared-components.module';

// COMPONENTS DVD
import { Alphaville1965Component } from './dvds/alphaville1965/alphaville1965.component';
// import { Badlieutenant1992Component } from './dvds/badlieutenant1992/badlieutenant1992.component';
import { Diehardwithavengeance1995Component } from './dvds/diehardwithavengeance1995/diehardwithavengeance1995.component';
import { Obandidodaluzvermelha1968Component } from './dvds/obandidodaluzvermelha1968/obandidodaluzvermelha1968.component';
import { Shivers1975Component } from './dvds/shivers1975/shivers1975.component';
import { Crash1996Component } from './dvds/crash1996/crash1996.component';
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { DvdPlayerComponent } from './dvd-player/dvd-player.component';
import { Itfollows2014Component } from './dvds/itfollows2014/itfollows2014.component';
import { Dunkirk2017Component } from './dvds/dunkirk2017/dunkirk2017.component';
import { Brideofthemonster1955Component } from './dvds/brideofthemonster1955/brideofthemonster1955.component';
import { Badlieutenant1992Component } from './dvds/badlieutenant1992/badlieutenant1992.component';
import { Nocturnalanimals2016Component } from './dvds/nocturnalanimals2016/nocturnalanimals2016.component';
import { MousevolumeDirective } from '../directives/mousevolume.directive';
import { Liquidsky1982Component } from './dvds/liquidsky1982/liquidsky1982.component';
import { Lolita1962Component } from './dvds/lolita1962/lolita1962.component';
import { Drstrangelove1964Component } from './dvds/drstrangelove1964/drstrangelove1964.component';
import { Rosemarysbaby1968Component } from './dvds/rosemarysbaby1968/rosemarysbaby1968.component';
import { Themanwhowasntthere2001Component } from './dvds/themanwhowasntthere2001/themanwhowasntthere2001.component';
import { Pi1998Component } from './dvds/pi1998/pi1998.component';
import { Nakedlunch1991Component } from './dvds/nakedlunch1991/nakedlunch1991.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TheAddiction1995Component } from './dvds/theaddiction1995/theaddiction1995.component';
import { Thedayofthejackal1973Component } from './dvds/thedayofthejackal1973/thedayofthejackal1973.component';
import { Zelig1983Component } from './dvds/zelig1983/zelig1983.component';
import { TestesInterceptor } from './testes.interceptor';
import { BasicdvdComponent } from './dvds/basicdvd/basicdvd.component';
import { ArquivosComponent } from './arquivos/arquivos.component';
import { OndemandComponent } from './ondemand/ondemand.component';
import { Martin1977Component } from './dvds/martin1977/martin1977.component';
import { StreamComponent } from './stream/stream.component';

@NgModule({
  declarations: [
    AppComponent,
    PlaylistComponent,

    Alphaville1965Component,
    Diehardwithavengeance1995Component,
    Obandidodaluzvermelha1968Component,
    Shivers1975Component,
    Crash1996Component,
    DvdPlayerComponent,
    Itfollows2014Component,
    TheAddiction1995Component,
    Dunkirk2017Component,
    Brideofthemonster1955Component,
    Badlieutenant1992Component,
    Nocturnalanimals2016Component,
    MousevolumeDirective,
    Liquidsky1982Component,
    Lolita1962Component,
    Drstrangelove1964Component,
    Rosemarysbaby1968Component,
    Themanwhowasntthere2001Component,
    Pi1998Component,
    Thedayofthejackal1973Component,
    Nakedlunch1991Component,
    NavbarComponent,
    GradeComponent,
    ProgramasComponent,
    Zelig1983Component,
    BasicdvdComponent,
    ArquivosComponent,
    OndemandComponent,
    Martin1977Component,
    StreamComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,

    TableModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // for firestore
    // SharedComponentsModule,
    NgxBootstrapIconsModule.pick(allIcons)
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: TestesInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
