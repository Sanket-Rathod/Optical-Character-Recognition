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
  if(testFeatures.length!==trainLabeledFeatures[0].features.length)return err('length doesn\'t match', { code: 'BAD_FMT' })
  let sum=0;
  let a = [];
  let tempA = [];
  let index=0;
  let countmap= new Map();
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
    // for(let i=0;i<10;i++)countmap.set(i,0);
    
    for(let indA of a){
      // console.log(parseInt(indA[1]));
      countDetails[parseInt(indA[1])]+=1;

      //Map
      if(countmap.has(parseInt(indA[1]))){
        countmap.set(parseInt(indA[1]),countmap.get(parseInt(indA[1]))+1);
      }
      else {
        countmap.set(parseInt(indA[1]),1);
      }
      
    }
  // console.log(maxcount);
  
  /*for(let i=0;i<countDetails.length;i++){
    
    // console.log("anda");
    if(countDetails[i]>maxcount){
      // console.log("andar");
      maxlabel = i;
      maxcount = countDetails[i];
    }
  }*/
  for(let [key,value] of countmap){
    // console.log(key+" "+value);
    if(value>maxcount){
      maxlabel = key;
      maxcount = value;
    }
  }
  // console.log(maxcount +" "+maxlabel +" ");
  for(let temp of a){
    if(parseInt(temp[1])===maxlabel){
      maxIndex = temp[2];
      
    }
    
  }
  
  let maxlabelstr = parseInt(maxlabel).toString();
  // console.log( a);
  // console.log( maxlabel.toString(), maxIndex);
   return {val:[maxlabel.toString(),maxIndex]};
  // 
  // for(let i=0;i<index;i++){
    
  //   a.push(tempA.sort((x,y)=>x[0]-y[0]).slice(0,k));
  // }
  // console.log(a);
  // a.sort((x,y)=> x[0]-y[0]).slice(0,k);

  // console.log(a);
  //return err('knn() not implemented', { code: 'NO_IMPL' });
}
