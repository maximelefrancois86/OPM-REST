import { Component, OnInit, Input } from '@angular/core';
import { AppData } from './app.data';
import { HttpClient } from '@angular/common/http';
import { AppService } from './app.service';
import 'codemirror/mode/turtle/turtle';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/sparql/sparql';

@Component({
    selector: 'app-step4',
    templateUrl: './step4.component.html',
    styleUrls: ['./app.component.css']
})
export class Step4Component implements OnInit {

    @Input() backend;
    @Input() db;

    public cmConfigTTL = { 
        lineNumbers: true,
        firstLineNumber: 1,
        lineWrapping: true,
        matchBrackets: true,
        mode: 'text/turtle'
    };
  
    public cmConfigJSON = this.cmConfigTTL;
    public cmConfigSPARQL = this.cmConfigTTL;

    public calculations;
    public outdated;
    public materialize;

    constructor(
        private _ad: AppData,
        private _as: AppService,
        private _http: HttpClient
    ) { }

    ngOnInit(): void {
        this.cmConfigJSON.mode = 'javascript';
        this.cmConfigSPARQL.mode = 'application/sparql-query';

        this.getCalculations();
    }

    public getCalculations(){
        this._as.getCalculations(this.backend, this.db).subscribe(res => {
            console.log(res);
            this.calculations = res['@graph'] ? res['@graph'] : [res];
            console.log(this.calculations);
        }, err => console.log(err))
    }

    public postAll(){
        this.calculations['@graph'].forEach(item => {
            this.postSingle(item);
        })
    }

    public postSingle(item){
        const url = item['@id'];
        const params = this.materialize ? {materialize: true} : {};
        this._http.post(url, {params}).subscribe(res => {
            item.result = res;
        }, 
        err => {
            console.log(err)
            item.result = err;
        })
    }

    public putSingle(item){
        const url = item['@id'];
        const params = this.materialize ? {materialize: true} : {};
        this._http.put(url,{}).subscribe(res => {
            console.log(res)
            item.result = res;
        }, 
        err => {
            console.log(err)
            item.result = err;
        })
    }

    public getOutdated(){
        this._as.getOutdated(this.backend, this.db).subscribe(res => {
            this.outdated = res;
        }, err => console.log(err))
    }

}