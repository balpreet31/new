export const SITE={phone:'+91 84474 52345',dial:'tel:+918447452345',whatsapp:'918447452345',email:'hello@probay.in',address:'FF12, SPS Residency, Plot No. 18B, Vaibhav Khand, Ghaziabad 201014, Uttar Pradesh',hours:'Mon–Sat, 9:30 AM – 6:00 PM'};
export const services=[
 ['Private Limited Company Registration','private-limited-company-registration.html','Start a business'],
 ['LLP Registration','llp-registration.html','Start a business'],
 ['One Person Company Registration','one-person-company-registration.html','Start a business'],
 ['Public Limited Company Registration','public-limited-company-registration.html','Start a business'],
 ['Partnership Firm Registration','partnership-firm-registration.html','Start a business'],
 ['Company Annual Filing','company-annual-filing.html','Stay compliant'],
 ['LLP Annual Filing','llp-annual-filing.html','Stay compliant'],
 ['ISIN & Shares Dematerialization','isin-registration-shares-dematerialization.html','Corporate actions'],
 ['Company Strike Off','company-strike-off.html','Corporate actions'],
 ['Event Based Compliance','event-based-compliances.html','Corporate actions'],
];
export const cities=['Noida','Ghaziabad','Delhi','Greater Noida','Other'];
export const wa=(message='Hi, I would like a free consultation.')=>`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
export const money=n=>'₹'+n.toLocaleString('en-IN');
