import test from 'node:test';
import assert from 'node:assert/strict';
import {enquiryLink,enquiryService,normalizePhone,validateEnquiry} from '../src/enquiry.js';
import {SITE,services} from '../src/site.js';

const valid={name:'Rahul Sharma',phone:'9876543210',city:'Delhi',service:services[0][0],consent:true};

test('accepts Indian phone formats and requires valid contact details and consent',()=>{
  for(const phone of ['9876543210','+91 98765 43210','09876543210']) {
    assert.equal(normalizePhone(phone),'9876543210');
    assert.deepEqual(validateEnquiry({...valid,phone}),{});
  }
  const errors=validateEnquiry({...valid,name:'A',phone:'1234567890',consent:false});
  assert.ok(errors.name);assert.ok(errors.phone);assert.ok(errors.consent);
  assert.ok(validateEnquiry({...valid,city:'Invalid'}).city);
  assert.ok(validateEnquiry({...valid,service:'Invalid'}).service);
});

test('service page aliases select the correct enquiry option',()=>{
  assert.equal(enquiryService('Event Based Compliances'),'Event Based Compliance');
  assert.equal(enquiryService('ISIN Registration & Shares Dematerialization'),'ISIN & Shares Dematerialization');
  for(const [service] of services) assert.equal(enquiryService(service),service);
});

test('WhatsApp handoff preserves contact, city, service, plan and special characters',()=>{
  const url=new URL(enquiryLink({...valid,name:'A & B + Co.',service:services[7][0]},'Premium'));
  assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,`/${SITE.whatsapp}`);
  const message=url.searchParams.get('text');
  for(const value of ['A & B + Co.',services[7][0],'Premium','Delhi','9876543210']) assert.ok(message.includes(value));
  assert.doesNotMatch(message,/reference|saved|received/i);
});
