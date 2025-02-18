import { Routes } from '@angular/router';
import {ViewComponent} from './pages/view/view.component';
import {StreamComponent} from './pages/stream/stream.component';

export const routes: Routes = [
  {
    path: '',
    component: ViewComponent,
  },
  {
    path: 'stream',
    component: StreamComponent
  },
  {
    path: '*',
    redirectTo: ''
  }
];
