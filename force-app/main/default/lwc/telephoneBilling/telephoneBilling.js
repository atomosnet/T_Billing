import { LightningElement, api, track } from 'lwc';
import getTemplateBilling from '@salesforce/apex/getTemplateBilling.getTemplateBilling';
import getOpportunityDetails from '@salesforce/apex/getTemplateBilling.getOpportunityDetails';
import getAccountDetails from '@salesforce/apex/getTemplateBilling.getAccountDetails';
import createOpportunityWithProducts from '@salesforce/apex/getTemplateBilling.createOpportunityWithProducts';
import { NavigationMixin } from 'lightning/navigation';
import getMonth from '@salesforce/apex/getTemplateBilling.getMonth';

export default class TelephoneBilling extends NavigationMixin(LightningElement) {
    @track opportunity = {
        Name: '',
        CloseDate: '',
        StageName: 'Closed Won',
        AccountId: '',
        Type: 'Renewal',
        ForecastCategory: 'Closed'
    };

    @track lineItems = [
        { Name: '', Product2Id: '', Quantity: 1, UnitPrice: 0, Buy_Price__c: 0, PricebookEntryId: '' }
    ];
    @track isLoading = false;

    @track monthlySale = {
        MonthId__c: '',
        Opportunity__c: ''
    }
    @track months = [
        { value: '', label: ''}
    ];
    @track selectedMonthId;
    clickedButtonLabel;
    //countries = ['Andorra','Austria','Brazil','Bulgaria','Croatia','Cyprus']
    countries = [];
    templateAccount = [];
    cleanCountries = [];
    account = [];
    accountName = "";
    connectedCallback() {
        getMonth()
            .then(response => {
                this.months = response.map(item => ({
                    value: item.Id,
                    label: item.Name,
                    
            }));
            this.monthlySale.MonthId__c =  this.months[0].value;
                
            
        })
            
        getOpportunityDetails()
            .then(response => {
                this.templateAccount = response;
                //this.accountName = this.templateAccount[0].AccoundId;
                this.templateName = this.templateAccount[0].Name;
                console.log('Template Account:', this.templateAccount);
                //console.log('Account Name:', this.accountName);
                this.opportunity.AccountId = this.templateAccount[0].AccountId;
                

               
                // Now fetch countries only after accountName is ready
                return getTemplateBilling();
            })
            .then(response => {
                this.countries = response;
               // console.log("Countries:", this.countries);
                /*this.countries = response.map(item => ({
                    ...item,
                    Name: item.Name
                }));*/
               this.lineItems = response.map(item => ({
                    Name: item.Name,
                    Product2Id: item.Product2Id,
                    Quantity: item.Quantity,
                    UnitPrice: item.UnitPrice,
                    PricebookEntryId: item.PricebookEntryId,
                    OpportunityId: item.OpportunityId
                }));


                
                //console.log('Line items loaded:', this.lineItems);
                
                return getAccountDetails({rId: this.templateAccount[0].AccountId});
            })
            .then(response => {
                this.account = response;
                console.log("Account:", this.account);
                
                this.accountName = this.account[0].Name;
                this.opportunity.Name = this.accountName;
                console.log('Account Name: ', this.accountName);
                this.lineItems = this.countries.map((item,i) => {
                    const cleanedName = item.Name.replace(this.templateAccount[0].Name + ' ', '').trim();
                    console.log(`Cleaned Name [${i}]:`, cleanedName);
                    

                    return {
                        Name: cleanedName,
                        Product2Id: item.Product2Id,
                        Quantity: item.Quantity,
                        UnitPrice: item.UnitPrice,
                        PricebookEntryId: item.PricebookEntryId,
                        OpportunityId: '',
                        Buy_Price__c: item.Buy_Price__c
                    };
                });


            })
            .catch(error => {
                console.error('Error loading data:', error);
            });

        console.log('connectedCallback complete');
    }

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
                let cleanedName = item.Name.replace(this.templateAccount[0].Name + ' ', '').trim();
                console.log(`Cleaned [${i}]: ${cleanedName}`);
                return {
                    Name: cleanedName,
                    Product2Id: item.Product2Id,
                    Quantity: item.Quantity,
                    UnitPrice: item.UnitPrice
                };
            });



        console.log("Clean Countries ", this.cleanCountries);
    }

    handleTemplateChange(event){
        
    }

    handleOppChange(event) {
        this.opportunity[event.target.name] = event.target.value;
        console.log("Changed ", event.target.name);
        console.log("Changed Event:", event.target.value);
        console.log("Opportunity:", this.opportunity);
    }

    handleProductChange(event) {
        const index = event.target.dataset.index;
        const field = event.target.name;
        this.lineItems[index][field] = event.target.value;
        console.log("changed Event:", event.target.value);
        console.log("Line Items:", this.lineItems);
    }

    handleClick(event) {
        this.clickedButtonLabel = event.target.label;
    }

    handleMonthChange(event){
        this.selectedMonthId = event.detail.value;
        this.monthlySale.MonthId__c = event.detail.value;
        console.log('Selected Month Id:', this.selectedMonthId);
    }

    async handleSubmit() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
        .reduce((validSoFar, input) => {
            input.reportValidity();
            return validSoFar && input.checkValidity();
        }, true);

        if (!allValid) {
            console.warn('Form is invalid, submission halted.');
            return; // stop if any required field is missing
        }

        this.isLoading = true; // start the spinner
        
        try {
            console.log("Opp :", this.opportunity);
            console.log("lineItems :", this.lineItems); 
            console.log("MS :", this.monthlySale.MonthId__c);    
            const result = await createOpportunityWithProducts({
                opp: this.opportunity,
                lineItems: this.lineItems,
                ms: this.monthlySale.MonthId__c
            });
            //console.log("Opp ID:", result);
            console.log("Account ID : ", this.opportunity.AccountId)
            /*this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: result, // the ID returned by Apex
                    objectApiName: 'Opportunity',
                    actionName: 'view'
                }
            });*/
            // /apex/tccxero__NewInvoice?RecordId={!Opportunity.Id}&AccountId={!Opportunity.AccountId}&MappingSetId=TCC
            this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: `/apex/tccxero__NewInvoice?RecordId=${result}&AccountId=${this.opportunity.AccountId}&MappingSetId=TCC`
                    }
                });

        } catch (error) {
            console.error(error);
            
        }
        finally { 
            this.isLoading = false; // stop the spinner
        }
    }
}