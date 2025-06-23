import { LightningElement, api, track } from 'lwc';
import getTemplateBilling from '@salesforce/apex/getTemplateBilling.getTemplateBilling';
import getOpportunityDetails from '@salesforce/apex/getTemplateBilling.getOpportunityDetails';
import getAccountDetails from '@salesforce/apex/getTemplateBilling.getAccountDetails';

export default class TelephoneBilling extends LightningElement {
    clickedButtonLabel;
    //countries = ['Andorra','Austria','Brazil','Bulgaria','Croatia','Cyprus']
    countries = [];
    templateAccount = [];
    cleanCountries = [];
    account = [];
    accountName = "";
    connectedCallback() {
        getOpportunityDetails()
            .then(response => {
                this.templateAccount = response;
                //this.accountName = this.templateAccount[0].AccoundId;
                this.templateName = this.templateAccount[0].Name;
                console.log('Template Account:', this.templateAccount);
                //console.log('Account Name:', this.accountName);

                // Now fetch countries only after accountName is ready
                return getTemplateBilling();
            })
            .then(response => {
                this.countries = response;
               // console.log("Countries:", this.countries);
                this.countries = response.map(item => ({
                    ...item,
                    Name: item.Name
                }));


                
                console.log("Account ID", this.templateAccount[0].AccountId);
                
                return getAccountDetails({rId: this.templateAccount[0].AccountId});
            })
            .then(response => {
                this.account = response;
                console.log("Account:", this.account);
                //console.log("Account Name:", this.account[0].Name);
                this.accountName = this.account[0].Name;
                this.removeOpName(); // Now safe to run
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });

        console.log('connectedCallback complete');
    }
    /*
    connectedCallback() {
        getOpportunityDetails().then(response=>{
            //this.templateAccount = response;
            this.templateAccount = response;
            this.accountName = this.templateAccount[0].Name;
            console.log(this.templateAccount);
            
            
        }).catch(error=> {
            console.log(error);
        })
        getTemplateBilling().then(response=>{
            //this.templateAccount = response;
            this.countries = response;
            console.log("Countries");
            console.log(this.countries);
            this.removeOpName()
        }).catch(error=> {
            console.log(error);
        })
        

        console.log('connectedCallback');
    }
    */

    removeOpName(){
       /*
        for(let i = 0; i < this.countries.length;){
            console.log(this.countries.length);
            console.log(this.countries[i].Name.replace(this.accountName+' ', ''));
            console.log(this.countries[i].Name);
            this.cleanCountries[i] = this.countries[i].Name.replace(this.accountName+' ', '');
                i++;
        }
*/
        console.log("account name : ", this.accountName);
       // console.log("account name :", this.accountName.replace("'", ""));
        this.cleanCountries = this.countries.map((item, i) => {
                let cleanedName = item.Name.replace(this.templateName + ' ', '').trim();
                console.log(`Cleaned [${i}]: ${cleanedName}`);
                return {
                    ...item,
                    Name: cleanedName
                };
            });



        console.log("Clean Countries ", this.cleanCountries);
    }

    handleClick(event) {
        this.clickedButtonLabel = event.target.label;
    }
}