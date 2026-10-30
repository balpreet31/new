import {cities, services, wa} from './site.js';

export function enquiryService(service) {
  const aliases={'Event Based Compliances':'Event Based Compliance','ISIN Registration & Shares Dematerialization':'ISIN & Shares Dematerialization'};
  return aliases[service]|| (services.some(([name])=>name===service)?service:services[0][0]);
}

export function normalizePhone(phone='') {
  return String(phone).replace(/\D/g,'').replace(/^(91|0)(?=\d{10}$)/,'');
}

export function validateEnquiry(values) {
  const errors={};
  if(values.name.trim().length<2||values.name.trim().length>100) errors.name='Please enter your full name (2–100 characters).';
  if(!/^[6-9]\d{9}$/.test(normalizePhone(values.phone))) errors.phone='Enter a valid 10-digit Indian mobile number.';
  if(!cities.includes(values.city)) errors.city='Please choose your city.';
  if(!services.some(([name])=>name===values.service)) errors.service='Please choose a service.';
  if(!values.consent) errors.consent='Please confirm we can contact you about this enquiry.';
  return errors;
}

export function enquiryLink(values,plan='') {
  return wa(`Hi, I am ${values.name.trim()}. I need help with ${values.service}${plan?` (${plan} plan)`:''} in ${values.city}. Please call me on ${normalizePhone(values.phone)}.`);
}
