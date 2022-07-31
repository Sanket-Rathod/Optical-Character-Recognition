import { ok, err } from 'cs544-js-utils';

export default function makeKnnWsClient(wsUrl) {
  return new KnnWsClient(wsUrl);
}

class KnnWsClient {
  constructor(wsUrl) {
    
    this.wsUrl = wsUrl;
  }

  /** Given a base64 encoding b64Img of an MNIST compatible test
   *  image, use web services to return a Result containing at least
   *  the following properties:
   *
   *   `label`: the classification of the image.
   *   `id`: the ID of the training image "closest" to the test
   *         image.
   * 
   *  If an error is encountered then return an appropriate
   *  error Result.
   */
  async classify(b64Img) {
    try{
      console.log('inside clasigy');
      const response =  await fetch(this.wsUrl + '/knn/images',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(b64Img),
      })
      // .then(e=>e.json());
    // console.log("res",response);
      const res = await response.json();
      if(res.errors){
        console.log("res is : ",res);
        return this.wsError(res);
      }
    return ok(res);
    // console.log(await fetch(this.wsUrl));
    }
    catch(e){
      return err(e);
    }
  }

  /** Return a Result containing the base-64 representation of
   *  the image specified by imageId.  Specifically, the success
   *  return should be an object containing at least the following
   *  properties:
   *
   *   `features`:
   *     A base-64 representation of the retrieved image bytes.
   *   `label`:
   *     The label associated with the image (if any).
   *
   *  If an error is encountered then return an appropriate
   *  error Result.
   */
  async getImage(imageId) {
    try{
      console.log('inside getinmage');
    const res = await fetch(this.wsUrl + '/knn/labels/'+imageId).then(e=>e.json());
    // console.log(res);
    return res;
    }
    catch(e){
      return err(e);
    }
    
  }

  /** convert an erroneous JSON web service response to an error Result. */
  wsError(jsonRes) {
    return err(jsonRes.errors[0].message, jsonRes.errors[0].options);
  }

}

