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
  let maxcount=-1, maxlabel=-1,maxIndex=-1;
  let countDetails = Array.from({length:10}).fill(0);
  // console.log(countDetails);
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
      // console.log(parseInt(indA[1]));
      countDetails[parseInt(indA[1])]+=1;
    }
  // console.log(maxcount);
  
  for(let i=0;i<countDetails.length;i++){
    // console.log("anda");
    if(countDetails[i]>maxcount){
      // console.log("andar");
      maxlabel = i;
      maxcount = countDetails[i];
    }
  }
  // console.log(maxcount +" "+maxlabel +" ");
  for(let temp of a){
    if(parseInt(temp[1])===maxlabel){
      maxIndex = temp[2];
      
    }
    
  }
  let maxlabelstr = parseInt(maxlabel).toString();

  console.log( maxlabel.toString(), maxIndex);
  //  return {val:[maxlabel.toString(),maxIndex]};
  // 
  // for(let i=0;i<index;i++){
    
  //   a.push(tempA.sort((x,y)=>x[0]-y[0]).slice(0,k));
  // }
  // console.log(a);
  // a.sort((x,y)=> x[0]-y[0]).slice(0,k);

  // console.log(a);
  //return err('knn() not implemented', { code: 'NO_IMPL' });
}
