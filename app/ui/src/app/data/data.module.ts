import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataservicesModule } from '@teiid/beetle-lib';
import { VirtualizationsComponent } from './virtualizations/virtualizations.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: VirtualizationsComponent,
    pathMatch: 'full'
  } ];

@NgModule({
  imports: [
    CommonModule,
    DataservicesModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ VirtualizationsComponent ]
})
export class DataModule { }
