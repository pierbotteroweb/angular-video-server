import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StreamingComponent } from "./streaming/streaming.component";
import { PlaylistComponent } from './playlist/playlist.component';
import { Alphaville1965Component } from "./dvds/alphaville1965/alphaville1965.component";
import { Diehardwithavengeance1995Component } from "./dvds/diehardwithavengeance1995/diehardwithavengeance1995.component";
// import { Badlieutenant1992Component } from "./dvds/badlieutenant1992/badlieutenant1992.component";
import { Obandidodaluzvermelha1968Component } from "./dvds/obandidodaluzvermelha1968/obandidodaluzvermelha1968.component";
// import { PainelComponent } from './painel/painel.component';
// import { ListaComponent } from './lista/lista.component';
import { Shivers1975Component } from './dvds/shivers1975/shivers1975.component';
import { Crash1996Component } from './dvds/crash1996/crash1996.component';
import { Itfollows2014Component } from './dvds/itfollows2014/itfollows2014.component';
import { Dunkirk2017Component } from './dvds/dunkirk2017/dunkirk2017.component';
import { Brideofthemonster1955Component } from './dvds/brideofthemonster1955/brideofthemonster1955.component';
import { Badlieutenant1992Component } from './dvds/badlieutenant1992/badlieutenant1992.component';
import { Nocturnalanimals2016Component } from './dvds/nocturnalanimals2016/nocturnalanimals2016.component';
import { Liquidsky1982Component } from './dvds/liquidsky1982/liquidsky1982.component';
import { Lolita1962Component } from './dvds/lolita1962/lolita1962.component';
import { Pi1998Component } from './dvds/pi1998/pi1998.component';
import { Drstrangelove1964Component } from './dvds/drstrangelove1964/drstrangelove1964.component';
import { Rosemarysbaby1968Component } from './dvds/rosemarysbaby1968/rosemarysbaby1968.component';
import { Themanwhowasntthere2001Component } from './dvds/themanwhowasntthere2001/themanwhowasntthere2001.component';
import { TiaComponent } from './tia/tia.component';
import { Nakedlunch1991Component } from './dvds/nakedlunch1991/nakedlunch1991.component';
import { GradeComponent } from './grade/grade.component';
import { ProgramasComponent } from './programas/programas.component';
import { TheAddiction1995Component } from './dvds/theaddiction1995/theaddiction1995.component';
import { Thedayofthejackal1973Component } from './dvds/thedayofthejackal1973/thedayofthejackal1973.component';
import { Zelig1983Component } from './dvds/zelig1983/zelig1983.component';
import { BasicdvdComponent } from './dvds/basicdvd/basicdvd.component';

const routes: Routes = [
  { path: '', component: PlaylistComponent},
  { path: 'dvd', component: Alphaville1965Component},
  { path: 'grade', component: GradeComponent},
  { path: 'programas', component: ProgramasComponent},
  { path: 'alphaville1965', component: Alphaville1965Component},
  { path: 'shivers1975', component: Shivers1975Component},
  { path: 'crash1996', component: Crash1996Component},
  { path: 'itfollows2014', component: Itfollows2014Component},
  { path: 'dunkirk2017', component: Dunkirk2017Component},
  { path: 'nocturnalanimals2016', component: Nocturnalanimals2016Component},
  { path: 'brideofthemonster1955', component: Brideofthemonster1955Component},
  { path: 'diehardwithavengeance1995', component: Diehardwithavengeance1995Component},
  { path: 'badlieutenant1992', component: Badlieutenant1992Component},
  { path: 'liquidsky1982', component: Liquidsky1982Component},
  { path: 'lolita1962', component: Lolita1962Component},
  { path: 'pi1998', component: Pi1998Component},
  { path: 'drstrangelove1964', component: Drstrangelove1964Component},
  { path: 'theaddiction1995', component: TheAddiction1995Component},
  { path: 'Thedayofthejackal1973', component: Thedayofthejackal1973Component},
  // { path: 'badlieutenant1992', loadChildren: () => import ('./dvds/badlieutenant1992/badlieutenant1992.module')
  //         .then(module=>module.Badlieutenant1992Module)},
  { path: 'streaming', component: StreamingComponent},
  { path: 'obandidodaluzvermelha1968', component: Obandidodaluzvermelha1968Component},
  { path: 'rosemarysbaby1968', component: Rosemarysbaby1968Component},
  { path: 'themanwhowasntthere2001', component: Themanwhowasntthere2001Component},
  { path: 'nakedlunch1991', component: Nakedlunch1991Component},
  { path: 'zelig1983', component: Zelig1983Component},
  { path: 'basicdvd', component: BasicdvdComponent},
  { path: 'filmesdatia', component: TiaComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
