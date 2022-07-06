import { ConnectionClosedEvent, MongoClient } from 'mongodb';

import { ok, err } from 'cs544-js-utils';

import { b64ToUint8Array, uint8ArrayToB64 } from './uint8array-b64.mjs';

export default async function makeFeaturesDao(dbUrl) {
  return await AuthDao.make(dbUrl);
}

class AuthDao {
  constructor(params) { Object.assign(this, params); }

  static async make(dbUrl) {
    let counter =0;
    const params = {};
    try {
      params._client = await (new MongoClient(dbUrl)).connect();
      //await params._client.connect();
      const db = await params._client.db('Features');
      const users = await db.collection('Features');
      params.users = users;
      params.counter = counter;
      // console.log(this.users);
      // await users.createIndex('loginId');
      // params.count = await users.countDocuments();
      return ok(new AuthDao(params));
    }
    catch (error) {
      return err(error.message, { code: 'DB' });
    }
  }

  async add(features, isB64, label) {
    // const { loginId } = user;
    // const result = await this.getByLoginId(loginId);
    // if (!result.hasErrors) {
    //   const msg = `there is already a user for login ${loginId}`;
    //   return err(msg, { code: 'EXISTS' });
    // }
    // else if (result.errors.length > 1 ||
	  //    result.errors[0].options.code !== 'NOT_FOUND') {
    //   return result;
    // }
    // const userId = await this.#nextUserId();
    if(!isB64){
      features = uint8ArrayToB64(features);
    }
    this.counter += 1;
    const featureId = new Date().getTime().toString(16)+"" + Math.floor(Math.random()*100) + Math.floor(Math.random()*100);
    // const featureId = Math.floor(Math.random()*100) + "_" + this.counter;
    const dbObj = { _id: featureId, features:features, label:label };
    try {
      const collection = this.users;
      const insertResult = await collection.insertOne(dbObj);
      const id1 = insertResult.insertedId;
      
    }
    catch (e) {
      return err(e.message, { code: 'DB' });
    }
    return ok(dbObj._id);
  }


  async getAllTrainingFeatures() {
    // console.log('reached here');
    let featureDetails =[];
    let i=0;
    try {
      const collection = this.users;
      // console.log(this.users);
      const dbEntries = await collection.find().toArray();
      // console.log(dbEntries);
      for(let dbEntry of dbEntries){
        // console.log(dbEntries[i].features +":"+dbEntries[i].label);
        if(dbEntry.label!==null){
          featureDetails.push({"features":b64ToUint8Array (dbEntry.features), "label" : dbEntry.label});
        }
          
      }
      if (featureDetails){
        // console.log('feature_details : '+featureDetails);
	      return ok(featureDetails);
      }
      else {
	      return err(`no user for id '${userId}'`, { code: 'NOT_FOUND' });
      }
    }
    catch (e) {
      return err(e.message, { code: 'DB' });
    }
  }

  async close() {
    try {
      await this._client.close();
    }
    catch (e) {
      err(e.message, { code: 'DB' });
    }
  }

  async get(userId, isB64) {
    try {
      const collection = this.users;
      const dbEntry = await collection.findOne({_id: userId});
      if (dbEntry) {
	let user = { userId, ...dbEntry };
  // console.log(user);
  if(!isB64){
    user.features = b64ToUint8Array(user.features);
  }
  // console.log(user);
        delete user._id;
        return ok(user);
      }
      else {
	return err(`no user for id '${userId}'`, { code: 'NOT_FOUND' });
      }
    }
    catch (e) {
      return err(e.message, { code: 'DB' });
    }
  }

  async clear() {
    try {
      const collection = this.users;
      const delResult = await collection.deleteMany();
      if (!delResult) {
	return err(`unexpected falsy DeleteResult`, {code: 'DB'});
      }
      else if (delResult.deletedCount === 0) {
	const msg = `no records to delete`;
	return err(msg, { code: 'NOT_FOUND' });
      }
      
      else {
	return ok(delResult);
      }
    }
    catch (e) {
      return err(e.message, { code: 'DB' });
    }
  }

}

