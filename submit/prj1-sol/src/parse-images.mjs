import { ok, err } from 'cs544-js-utils';

/** parse byte streams in imageBytes: { images: Uint8Array, labels:
 *  Uint8Array } as per imageSpecs { images: HeaderSpec[], labels:
 *  HeaderSpec[] } to return a list of LabeledFeatures (wrapped within
 *  a Result).
 *
 *  Errors:
 *    BAD_VAL: value in byte stream does not match value specified
 *             in spec.
 *    BAD_FMT: size of bytes stream inconsistent with headers
 *             or # of images not equal to # of labels.
 */
export default function parseImages(imageSpecs, imageBytes) {//headers, buffer
  const image_dv = new Uint8Array(imageBytes.images);
  const label_dv = new Uint8Array(imageBytes.labels);
  
  // const label_dv = new DataView(imageBytes.labels);
  
  const image_data = new DataView(image_dv.buffer);
  const label_data = new DataView(label_dv.buffer);
  const magic_image = image_data.getInt32(0,false);
  const magic_label = label_data.getInt32(0,false);
  
  const rows = image_data.getInt32(8,false);
  const cols = image_data.getInt32(12,false);
  let images = [];
  let label = [];
  let object = [];
  let test, nImages;
  const n_data = image_data.getInt32(4,false);


  for(let i=0;i<imageSpecs.labels.length;i++){
    if(imageSpecs.labels[i].name==='magic')
    {
      // console.log("magicccc");
      test =imageSpecs.labels[i].value;
      // console.log("test: ",test);
      // console.log("magic_label: ",magic_label);
      if(test!=magic_label) return err('magic number for label incoorect', {code:'BAD_VAL', hasErrors:true});
    }

  }

  for(let i=0;i<imageSpecs.images.length;i++){
    if(imageSpecs.images[i].name==='magic')
    {
      test =imageSpecs.images[i].value;
      
      if(test!=magic_image) return err('magic number for image incoorect', {code:'BAD_VAL', hasErrors:true});
    }
    if(imageSpecs.images[i].name==='nImages')
    {
      nImages =imageSpecs.images[i].value;
    }
    if(imageSpecs.images[i].name==='nRows')
    {
      test =imageSpecs.images[i].value;
      
      if(test!=rows) return err('rows incorrect', {code:'BAD_VAL', hasErrors:true});
    }
    if(imageSpecs.images[i].name==='nCols')
    {
      test =imageSpecs.images[i].value;
      
      if(test!==cols) return err('cols incorrect', {code:'BAD_VAL', hasErrors:true});
    }
  
  }
 // console.log("image_data.length "+ image_dv.length);
  if((image_dv.length-16)/(rows*cols)!==n_data) return err('image length incorrect', {code:'BAD_FMT', hasErrors:true});
  //console.log("label_data.length "+ image_dv.length);
  if((label_dv.length-8)!==n_data) return err('label length incorrect', {code:'BAD_FMT', hasErrors:true});
  // console.log("r"+rows);
  // console.log(cols);

  // console.log(n_data + " " + rows + " "+ cols);
  let image = [];

  for(let i=0;i<n_data;i++){
    image = [];
    let single_label = imageBytes.labels[i+8]
    label.push(single_label);
    let row = [];
    for(let r=0;r<rows;r++){
      
      
      let pixel;
      for(let c=0;c<cols;c++){
        // if(cols!==28)return err('inconsistent cols', {code : 'BAD_FMT', hasErrors : true})
        pixel= imageBytes.images[(i * rows * cols) + (c+ (r * rows)) + 16];
        // console.log(pixel);
        if(pixel!=null)
          row.push(pixel);
      }
      
        // image.push(row);
      
    }
    images.push(row);
    // console.log(label);
    object.push({features: row, label:single_label.toString()});
   
  }
  // object.push({features: images, label:label});
  
  
 // if(images.length !== label.length)return err('must detect inconstency between # of labels and # of images', {code:'BAD_FMT', hasErrors:true});
  return {val : object,hasErrors:false}
  // if(ok){//check if ok works
  //   return  ;//.val is checked in doknn
  // }
  return err('parseImages() not implemented', { code: 'NO_IMPL' });
}



