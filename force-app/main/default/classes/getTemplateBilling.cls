public with sharing class getTemplateBilling {
    @AuraEnabled // needs to be global for aura component. Cannot access getTemplateBilling without it
    public static List<OpportunityLineItem> getTemplateBilling(String rId){
        if (rId == null) {
                throw new AuraHandledException('rID is null');
            }
        try {
            //return [SELECT Id, Name, Product2Id, ProductCode FROM OpportunityLineItem Where OpportunityId = '006P600000L9DmjIAF' LIMIT 1];
            return [SELECT Id, Name, Product2Id, ProductCode, Quantity, UnitPrice, Buy_Price__c, PricebookEntryId, Description FROM OpportunityLineItem Where OpportunityId = :rId ORDER BY SortOrder];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static List<Opportunity> getOpportunityDetails(String rId){
        // if id is null '006P600000L9DmjIAF'
        if (rId == null) {
                throw new AuraHandledException('rID is null');
            }
        try {
            //return [SELECT Id, Name, Product2Id, ProductCode, Invoice_Line_Description__c FROM OpportunityLineItem Where OpportunityId = '006P600000L9DmjIAF' LIMIT 1];
            return [SELECT Id, Name, AccountId, Invoice_Line_Description__c FROM Opportunity Where Id = :rId LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true) 
    public static List<Account> getAccountDetails(String rId){
        if (rId == null) {
                throw new AuraHandledException('rID is null');
            }
        try {
            //return [SELECT Id, Name, Product2Id, ProductCode FROM OpportunityLineItem Where OpportunityId = '006P600000L9DmjIAF' LIMIT 1];
            return [SELECT Id, Name FROM Account Where Id = :rId LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Opportunity> getTemplates(){
        try {
            //return [SELECT Id, Name, Product2Id, ProductCode FROM OpportunityLineItem Where OpportunityId = '006P600000L9DmjIAF' LIMIT 1];
            return [SELECT Id, Name, AccountId FROM Opportunity Where Name like 'Template%' LIMIT 20];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Month__c> getMonth(){
        try {
            //return [SELECT Id, Name, Product2Id, ProductCode FROM OpportunityLineItem Where OpportunityId = '006P600000L9DmjIAF' LIMIT 1];
            return [SELECT Id, Name FROM Month__c];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Id createOpportunityWithProducts(Opportunity opp, List<OpportunityLineItem> lineItems, String ms) {
        try {
            if (opp == null || lineItems == null || ms == null || lineItems.isEmpty()) {
                throw new AuraHandledException('Opportunity and Line Items are required.');
            }

            // Insert Opportunity
            insert opp;

            // Associate the Opportunity Id with each line item
            for (OpportunityLineItem oli : lineItems) {
                oli.OpportunityId = opp.Id;
            }

            // Insert Line Items
            insert lineItems;

            MonthlySales__c monthlySale = new MonthlySales__c(MonthId__c = ms, Opportunity__c = opp.Id);
            insert monthlySale;

            return opp.Id;
        } catch (Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    
}