import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataservicesModule } from 'beetle-lib';
import { VirtualizationsComponent } from './virtualizations/virtualizations.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'data',
    component: VirtualizationsComponent
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
