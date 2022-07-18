import cors from 'cors';
import express, { application } from 'express';
import bodyparser from 'body-parser';
import assert from 'assert';
import STATUS from 'http-status';

import { ok, err } from 'cs544-js-utils';
import { knn } from 'prj1-sol';
import { uint8ArrayToB64, b64ToUint8Array, makeFeaturesDao } from 'prj2-sol';

import fs from 'fs';
import http from 'http';
import https from 'https';

export const DEFAULT_COUNT = 5;

/** Start KNN server.  If trainData is specified, then clear dao and load
 *  into db before starting server.  Return created express app
 *  (wrapped within a Result).
 *  Types described in knn-ws.d.ts
 */
export default async function serve(knnConfig, dao, data) {
  try {
    const app = express();

    //TODO: squirrel away knnConfig params and dao in app.locals.
    app.locals.knnConfig = knnConfig;
    app.locals.dao = dao;
    app.locals.base = knnConfig.base;
    app.locals.k = knnConfig.k;
    // console.log(app.locals);
    // console.log(dao._client.s.url);
    app.locals.dao = await makeFeaturesDao(dao._client.s.url);
    if (data) {
      //TODO: load data into dao
      // console.log("dao",app.locals.dao);
      await app.locals.dao.val.clear();
      for(let d of data){
         //console.log(d);
        await app.locals.dao.val.add(uint8ArrayToB64(d.features),true,d.label);
      }
    }

    //TODO: get all training results from dao and squirrel away in app.locals
    // console.log('completed');
    app.locals.trainingImages = await app.locals.dao.val.getAllTrainingFeatures();
    // console.log('completed fetch all training images');
    // console.log(app.locals.trainingImages);
    //set up routes
    
    setupRoutes(app);

    return ok(app);
  }
  catch (e) {
    return err(e.toString(), { code: 'INTERNAL' }); 
  }
}


function setupRoutes(app) {
  const base = app.locals.base;
  app.use(cors({exposedHeaders: 'Location'}));
  app.use(express.json({strict: false})); //false to allow string body
  //app.use(express.text());

  //uncomment to log requested URLs on server stderr
  //app.use(doLogRequest(app));

  //TODO: add knn routes here
  app.post(`${base}/images`,registerImages(app));
  app.get(`${base}/images/:imageID`,getImageById(app));
  app.get(`${base}/labels/:imageID`,findLabelByID(app));
  //must be last
  app.use(do404(app));
  app.use(doErrors(app));
}


//dummy handler to test initial routing and to use as a template
//for real handlers.  Remove on project completion.
function registerImages(app) {
  return (async function(req, res) {
    try {
      // console.log(req);
      // console.log("params = : "+req.params);
      const imageFeature = req.body;
      //console.log('inside post');
      // console.log(imageFeature);
      
      //req.param
      //app/localdao
      //dao.add()
      const result = await app.locals.dao.val.add((imageFeature),true);
      //console.log(result);
      // if (result.hasErrors) throw result;
      
      //console.log(result.val);
      //dao.get
      res.status(200).json({id : result.val});
      // res.json({status: 200});
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

function getImageById(app) {
  return (async function(req, res) {
    try {
      // console.log(req.params);
      
      // console.log('inside getImageById');
      
    
      const result = await app.locals.dao.val.get(req.params.imageID,true);
      if (result.hasErrors) throw result;
      
      //console.log("result11111",result.val);
      //dao.get
      res.status(200).json({features : result.val.features, label: result.val.label});
      // res.json({status: 200});
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

function findLabelByID(app) {
  return (async function(req, res) {
    try {
      //console.log(req.params);
     
      //console.log('inside findLabelByID');
      const base = app.locals.base;
      const testFeature = await app.locals.dao.val.get(req.params.imageID,true);
      //console.log(testFeature.val);
      const array = b64ToUint8Array(testFeature.val.features);

      const trainingFeatures = await app.locals.dao.val.getAllTrainingFeatures();
     // console.log(trainingFeatures.val[0].features);
      //console.log(array);
      if(trainingFeatures.val[0].features.length==array.length){
      const label = await knn(array,trainingFeatures.val,req.query.k);
      const result = await app.locals.dao.val.get(req.params.imageID,true);
      if (result.hasErrors) throw result;
      
      // console.log(result.val);
      //dao.get
      // console.log("labels",label);
      res.status(200).json({id : trainingFeatures.val[label.val[1]].id, label :label.val[0]});
      // res.json({status: 200});
      }else
      {
        throw err("BAD_FMT",{code:"BAD_FMT"});
      }
    }
    catch(err) {
      const mapped = mapResultErrors(err);
      res.status(mapped.status).json(mapped);
    }
  });
}

//TODO: add real handlers


/** Handler to log current request URL on stderr and transfer control
 *  to next handler in handler chain.
 */
function doLogRequest(app) {
  return (function(req, res, next) {
    console.error(`${req.method} ${req.originalUrl}`);
    next();
  });
}
  
/** Default handler for when there is no route for a particular method
 *  and path.
 */
function do404(app) {
  return async function(req, res) {
    const message = `${req.method} not supported for ${req.originalUrl}`;
    const result = {
      status: STATUS.NOT_FOUND,
      errors: [	{ options: { code: 'NOT_FOUND' }, message, }, ],
    };
    res.status(404).json(result);
  };
}


/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    const message = err.message ?? err.toString();
    const result = {
      status: STATUS.INTERNAL_SERVER_ERROR,
      errors: [ { options: { code: 'INTERNAL' }, message } ],
    };
    res.status(STATUS.INTERNAL_SERVER_ERROR).json(result);
    console.error(result.errors);
  };
}

/*************************** Mapping Errors ****************************/

//map from domain errors to HTTP status codes.  If not mentioned in
//this map, an unknown error will have HTTP status BAD_REQUEST.
const ERROR_MAP = {
  EXISTS: STATUS.CONFLICT,
  NOT_FOUND: STATUS.NOT_FOUND,
  AUTH: STATUS.UNAUTHORIZED,
  DB: STATUS.INTERNAL_SERVER_ERROR,
  INTERNAL: STATUS.INTERNAL_SERVER_ERROR,
}

/** Return first status corresponding to first options.code in
 *  errors, but SERVER_ERROR dominates other statuses.  Returns
 *  BAD_REQUEST if no code found.
 */
function getHttpStatus(errors) {
  let status = null;
  for (const err of errors) {
    const errStatus = ERROR_MAP[err.options?.code];
    if (!status) status = errStatus;
    if (errStatus === STATUS.SERVER_ERROR) status = errStatus;
  }
  return status ?? STATUS.BAD_REQUEST;
}

/** Map domain/internal errors into suitable HTTP errors.  Usually,
  * the err argument should be a Result; if not, this functions makes
  * a best attempt to come up with reasonable error messsages.
  * Return'd object will have a "status" property corresponding to
  * HTTP status code.
  */
function mapResultErrors(err) {
  //if Error, then dump as much info as possible to help debug cause of problem
  if (err instanceof Error) console.error(err); 
  const errors = err.errors ?? [ { message: err.message ?? err.toString() } ];
  const status = getHttpStatus(errors);
  if (status === STATUS.INTERNAL_SERVER_ERROR)  console.error(errors);
  return { status, errors, };
} 

