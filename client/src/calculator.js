export function estimate({entity='pvt',state='up',capital=100000,people=2,plan='standard'}={}){
 if(!['pvt','opc','llp'].includes(entity)||!['up','delhi'].includes(state)||!['basic','standard','premium'].includes(plan))throw new Error('Invalid estimate selection');
 if(capital==='more')return {manual:true,total:null,rows:[],fee:0,gst:0};
 const c=Number(capital),n=Number(people),rows=[];
 if(!Number.isFinite(c)||c<=0||!Number.isInteger(n)||n<1||n>5)throw new Error('Invalid estimate values');
 const fees={pvt:{basic:999,standard:3999,premium:9999},opc:{basic:999,standard:3499,premium:8999},llp:{basic:1499,standard:4499,premium:9999}};
 const fee=fees[entity][plan],included=plan==='basic'?0:entity==='opc'?1:2;
 if(entity==='llp'){
  rows.push(['Name reservation (RUN-LLP)',200],['MCA incorporation fee (FiLLiP)',c<=100000?500:c<=500000?2000:c<=1000000?4000:5000],['Stamp duty on LLP Agreement',state==='delhi'?Math.min(Math.round(c*.01),5000):Math.round(c*.01)],['Form 3 filing fee',c<=100000?50:c<=500000?100:c<=1000000?150:200]);
 }else rows.push(['Name reservation (SPICe+ Part A)',1000],['MCA incorporation fee (capital ≤ ₹15 lakh)',0],[`Stamp duty — MoA (${state==='up'?'UP':'Delhi'})`,state==='up'?500:200],['Stamp duty — AoA',state==='up'?(c>500000?1000:500):Math.round(c*.0015)],['Stamp duty — SPICe+ form',10]);
 rows.push(['PAN + TAN',131],[`Digital Signatures — ${n}${included?` (${included} included in plan)`:''}`,Math.max(0,n-included)*1200]);
 const gst=Math.round(fee*.18);return {manual:false,total:rows.reduce((sum,r)=>sum+r[1],0)+fee+gst,rows,fee,gst};
}
