import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../app/auth/auth.guard';

const routes: Routes = [
  {
    path: '', redirectTo : 'auth', pathMatch : 'full'
  },
  { path: 'auth', loadChildren: './auth/auth.module#AuthPageModule' },
  {
    path: 'app',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),canLoad: [AuthGuard]
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
