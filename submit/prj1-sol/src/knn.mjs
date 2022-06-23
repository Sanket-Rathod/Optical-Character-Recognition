import { ok, err } from 'cs544-js-utils';

/** return pair [label, index] (wrapped within a Result) of the
 *  training LabeledFeatures trainLabeledFeatures having the most
 *  common label of the k training features closest to subject
 *  testFeatures.
 *
 *  Errors:
 *    BAD_FMT: trainLabeledFeatures has features bytes with length 
 *             different from length of subject testFeatures.
 */
export default function  knn(testFeatures, trainLabeledFeatures, k=3) {
  let sum=0;
  let a = [];
  let tempA = [];
  let index=0;
  let counts = [];
  let maxcount, maxlabel;
  let countDetails = Array.from({length:10}).fill(0);
  console.log(countDetails);
  // console.log(trainLabeledFeatures.length);
  
    for(let trainDetails of trainLabeledFeatures){
      // console.log(trainDetails);
      const {features,label} =trainDetails
      // console.log(features);
    
      const diffSum = testFeatures.map((el,ind) => (el-features[ind])).reduce((previousValue,currentValue)=>previousValue+(currentValue**2),0);
      // console.log(diffSum);
      
      tempA.push([diffSum,label,index]);
      // a.push([diffSum,label,index]);
  
      
      index++;
      if(index===trainLabeledFeatures.length){
        a = (tempA.sort((x,y)=>x[0]-y[0]).slice(0,k));
        index=0;
      }
    }
    for(let indA of a){
      console.log(parseInt(indA[1]));
      countDetails[parseInt(indA[1])]+=1;
    }
  console.log(countDetails);
  for(let i=0;i<countDetails.length;i++){
    if(maxcount<countDetails[i]){
      maxlabel = i;
      maxcount = countDetails[i];
    }
  }
  for(let temp of a){
    
  }
  console.log(a);
  // for(let i=0;i<index;i++){
    
  //   a.push(tempA.sort((x,y)=>x[0]-y[0]).slice(0,k));
  // }
  // console.log(a);
  // a.sort((x,y)=> x[0]-y[0]).slice(0,k);

  // console.log(a);
  return err('knn() not implemented', { code: 'NO_IMPL' });
}
