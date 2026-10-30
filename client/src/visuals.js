export const serviceVisuals={
 'private-limited-company-registration':'service-private',
 'llp-registration':'service-llp',
 'one-person-company-registration':'service-opc',
 'public-limited-company-registration':'service-public',
 'partnership-firm-registration':'service-partnership',
 'company-annual-filing':'service-annual',
 'llp-annual-filing':'service-llpannual',
 'isin-registration-shares-dematerialization':'service-isin',
 'company-strike-off':'service-strikeoff',
 'event-based-compliances':'service-events',
};
export const guideVisuals={
 'private-limited-vs-llp-vs-opc.html':'guide-structure',
 'company-registration-cost-in-india.html':'guide-cost',
 'documents-required-for-company-registration.html':'guide-documents',
 'company-registration-process-step-by-step.html':'guide-process',
 'registered-office-address-rules.html':'guide-office',
 'delhi-vs-noida-where-to-register-company.html':'guide-geography',
 'post-incorporation-compliances.html':'guide-firstdays',
 'annual-compliance-checklist-private-limited-company.html':'guide-compliance',
 'roc-compliance-calendar.html':'guide-calendar',
 'director-disqualification-section-164.html':'guide-directors',
 'rule-9b-dematerialisation-private-companies.html':'guide-demat',
 'how-to-close-a-company-in-india.html':'guide-closure',
 'cost-calculator.html':'guide-cost',
 'guides.html':'guide-structure',
};
export function pageVisual(path){
 const filename=path.split('/').pop();
 if(guideVisuals[filename])return guideVisuals[filename];
 const city=filename.match(/^company-registration-in-(noida|delhi|ghaziabad)\.html$/)?.[1];
 if(city)return `city-${city}`;
 const service=Object.keys(serviceVisuals).find(s=>filename===`${s}.html`||filename.startsWith(`${s}-in-`));
 if(service)return serviceVisuals[service];
 return ['terms.html','privacy-policy.html','refund-policy.html'].includes(filename)?'guide-documents':'advisory-v2';
}
export const visualAlt={
 'service-private':'A founder’s bright workspace overlooking contemporary commercial architecture',
 'service-llp':'Two navy chairs at a white collaboration table',
 'service-opc':'A single founder’s clean and carefully arranged workstation',
 'service-public':'Glass office towers rising into a clear blue sky',
 'service-partnership':'Two precision pens arranged on a blank agreement folder',
 'service-annual':'Carefully organised annual-report folders and records',
 'service-llpannual':'A calendar, financial notebooks and calculator on a white desk',
 'service-isin':'Precise glass and steel architectural detail',
 'service-strikeoff':'A closed document folder and capped pen beside a clear tray',
 'service-events':'Sorted document folders in white modular trays',
 'city-noida':'Conceptual Noida-inspired technology district and metro boulevard',
 'city-ghaziabad':'Conceptual Ghaziabad-inspired modern industrial campus',
 'city-delhi':'Conceptual Delhi-inspired colonnaded commercial avenue',
 'guide-structure':'Three notebooks representing different business structures',
 'guide-cost':'A calculator, financial charts and planning materials',
 'guide-documents':'A carefully arranged document folder with blue page dividers',
 'guide-process':'A white staircase rising through a bright architectural atrium',
 'guide-office':'A contemporary coworking space in bright daylight',
 'guide-geography':'An urban boulevard connecting contemporary business districts',
 'guide-firstdays':'A fresh notebook and pen for a new business chapter',
 'guide-compliance':'A neatly organised annual planning binder',
 'guide-calendar':'A blank desktop calendar and notebook for deadline planning',
 'guide-directors':'An orderly boardroom prepared for responsible governance',
 'guide-demat':'Transparent glass panels with precise blue edges',
 'guide-closure':'An open white office doorway and a closed document folder',
 'advisory-v2':'A clean document desk overlooking a contemporary skyline',
 'hero-v2':'Contemporary white-and-glass architecture beneath a blue sky',
};
