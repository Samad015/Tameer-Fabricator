function calculate({width,height,unit,shutterType}, rate=95) {
 if(!['manual','gear','motorized'].includes(shutterType)||!['feet','inches'].includes(unit)||![width,height].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>0&&n<=10000)||!Number.isFinite(rate)||rate<=0||rate>100000) throw new Error('Enter a valid shutter type, units, and dimensions between 0 and 10,000.');
 const area=width*height/(unit==='inches'?144:1);
 const weight=area*(shutterType==='manual'?2.2:2.6);
 const shutterCost=weight*rate,lockCost=700,gearCost=shutterType==='gear'?5000:0,motorCost=shutterType==='motorized'?30000:0;
 return {type:shutterType==='manual'?'Manual Shutter':shutterType==='gear'?'Gear Shutter':'Motorized Shutter',totalSqFt:area,totalWeight:weight,estimatedPrice:shutterCost,appliedRate:rate,lockCost,gearCost,motorCost,total:shutterCost+lockCost+gearCost+motorCost,currency:'INR',approximate:true,exclusions:'Freight excluded. Confirm GST and installation with the fabricator.'};
}
module.exports={calculate};
