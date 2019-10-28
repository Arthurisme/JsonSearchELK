import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {FormControl} from '@angular/forms';
// @ts-ignore
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatOption} from '@angular/material/core';

import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';


// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// @ts-ignore
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
// @ts-ignore
import {default as _rollupMoment} from 'moment';
import {DataStorageService} from '../../shared/data-storage.service';
import {MatDatepickerInputEvent, MatSelectChange} from '@angular/material';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/



export interface Range {
  value: number;
  viewValue: string;
}


@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
  ],
})
export class RecipeListComponent implements OnInit, OnDestroy {

  constructor(private recipeService: RecipeService,
              private router: Router,
              private dataStorageService: DataStorageService,
              private route: ActivatedRoute) {
  }
  recipes: Recipe[];
  subscription: Subscription;
  events: string[] = [];
  startDateTime
  startDate;
  endDate;
  range;
  ranges: Range[] = [
    {value: 1, viewValue: 'Week'},
    {value: 2, viewValue: 'Month'},
    {value: 3, viewValue: 'Quarter'}
  ];
   pageCurrent = 0;

  // date = new FormControl(moment());

  myFilter = (d: Date): boolean => {
    const day = d.getDay();
    const date = d.getDate();
    // Prevent Saturday and Sunday from being selected.
    return day === 0 || date === 1 ;
  }


  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.events.push(`${type}: ${event.value}`);
    this.startDateTime = event.value;
    console.log('startDateTime event', this.startDateTime);

  }

  onSelectRange(event: MatSelectChange) {
    const selectedData = {
      text: (event.source.selected as MatOption).viewValue,
      value: event.source.value
    }
    this.range = event.source.value;
    console.log('onSelectRange', selectedData);


  }

  ngOnInit() {
    this.subscription = this.recipeService.recipesChanged
      .subscribe(
        (recipes: Recipe[]) => {
          this.recipes = recipes;
        }
      );
    this.recipes = this.recipeService.getRecipes();
  }

  onNewRecipe() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  onFetchData() {
    var startDatel;
    var endDatel;

    // get next weekend day:
    if (this.range === 1){

      var datePicked = new Date(this.startDateTime); // get current date
      var first = datePicked.getDate() - datePicked.getDay(); // First day is the day of the month - the day of the week
      var last = first + 6; // last day is the first day + 6

      var firstday = new Date(datePicked.setDate(first));
      var lastday = new Date(datePicked.setDate(last));
      startDatel = firstday;
      endDatel = lastday;
      console.log('onSelectRange:startDateTime', startDatel);
      console.log('onSelectRange:endDateTime', endDatel);

    }else if(this.range === 2){

      const date = new Date(this.startDateTime);
      var firstday = new Date(date.getFullYear(), date.getMonth(), 1);
      var lastday = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      startDatel = firstday;
      endDatel = lastday;
      console.log('onSelectRange:startDateTime', startDatel);
      console.log('onSelectRange:endDateTime', endDatel);
    }else if(this.range === 3){


      var date = new Date(this.startDateTime);
      var quarter = Math.floor((date.getMonth() / 3));
      var firstDate = new Date(date.getFullYear(), quarter * 3, 1);
      var endDate = new Date(firstDate.getFullYear(), firstDate.getMonth() + 3, 0);
      startDatel = firstDate;
      endDatel = endDate;
      console.log('onSelectRange:startDateTime', startDatel);
      console.log('onSelectRange:endDateTime', endDatel);
    }

    // format date to yyyy-mm-dd
    var startDatefl = new Date(startDatel);
     var month = '' + (startDatefl.getMonth() + 1);
     var day = '' + startDatefl.getDate();
     var year = startDatefl.getFullYear();

     if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    var startDatef =  [year, month, day].join('-');

    var endDatefl = new Date(endDatel);
    var month = '' + (endDatefl.getMonth() + 1);
    var day = '' + endDatefl.getDate();
    var year = endDatefl.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    var endDatef =  [year, month, day].join('-');


    this.startDate= startDatef;
    this.endDate= endDatef;


    console.log('onSelectRange:startDatef', startDatef);
    console.log('onSelectRange:endDateTime', endDatef);


    this.dataStorageService.fetchRecipes(startDatef, endDatef).subscribe();
  }
  goPreviousPage(){
    if(this.pageCurrent >=1){
      this.dataStorageService.fetchRecipes(this.startDate, this.endDate, this.pageCurrent - 1).subscribe();
    }

  }

  goNextPage(){
    this.dataStorageService.fetchRecipes(this.startDate, this.endDate, this.pageCurrent + 1).subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
