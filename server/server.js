const express=require("express");
const bodyParser=require("body-parser");
const {MongoClient,ObjectId} = require("mongodb");
const Issue = require("./issue.js");
const path = require("path");

const app = express();
app.use(express.static('static'));
app.use(bodyParser.json());

let db;

/*if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const config = require('../webpack.config');
  config.entry.app.push('webpack-hot-middleware/client','webpack/hot/only-dev-server');
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  const bundler = webpack(config);
  app.use(webpackDevMiddleware(bundler, {}));
  app.use(webpackHotMiddleware(bundler, { log: console.log }));
}*/

app.get('/api/issues', (req,res)=>{
	console.log(req.url);
	let filters = {};
	if(req.query.status){
		filters.status = req.query.status;
	}
	
	if(req.query.effort_lte || req.query.effort_gte){
		filters.effort = {};
	}
	
	if(req.query.effort_lte) filters.effort.$lte = parseInt(req.query.effort_lte,10);
	if(req.query.effort_gte) filters.effort.$gte = parseInt(req.query.effort_gte,10);
	console.log(filters.effort);
	db.collection('issues').find(filters).toArray().then(docs => {
		const metaData = {totalCount: docs.length};
		res.json({_metaData: metaData, records: docs});
	}).catch(err =>{
		console.log("Error in get API: ",err);
		res.status(500).json({'message': `Internal server error: ${err}`});
	})
});

app.post('/api/issues/',(req,res)=>{
	const newIssue = req.body;
	//newIssue.id = issues.length + 1;
	newIssue.created = new Date();
	
	if(!newIssue.status){
		newIssue.status = "New";
	}
	
	const err = Issue.validateIssue(newIssue);
	if(err){
		res.status(422).json({message: `Invalid request: ${err}`});
		return;
	}
	
	//issues.push(newIssue);
	
	db.collection('issues').insertOne(newIssue).then(result => {
		console.log(result.insertedId);
		return db.collection('issues').findOne({_id: result.insertedId});
	}).then(insertedIssue =>{
		console.log(insertedIssue);
		res.json(insertedIssue);
	}).catch(err =>{
		res.status(500).json({message: `Internal server error ${err}`});
	});
});

app.get('/api/issues/:id', (req,res)=>{
	let issueId;
	try{
		issueId = new ObjectId(req.params.id);
	}catch(e){
		res.status(422).json({message: `Invalid issue id format: ${e}`});
		return;
	}
	
	db.collection('issues').findOne({_id: issueId}).then(issue => {
		if(!issue){
			res.status(500).json({message: `No such issue: ${issue}`});
		} else {
			res.json(issue);
		}
	}).catch(e => {
		console.log(e);
		res.status(500).json({message: `Internal server error: ${e}`});
	});
});

app.put('/api/issues/:id', (req,res)=>{
	console.log("Reached put API",req.body.title);
	let issueId;
	try{
		issueId = new ObjectId(req.params.id);
	} catch(err) {
		res.status(422).json({message: `Invalid issue idi format: ${err}`});
		return;
	}
	
	let issue = req.body;
	delete issue._id;
	
	console.log(`${issueId}, ${issue.status}`);
	
	const err = Issue.validateIssue(issue);
	
	if(err){
		console.log("Error in validation",err);
		res.status(422).json({message: `Invalid request: ${err}`});
		return;
	} 
	
db.collection('issues').updateOne({_id: issueId},{$set: Issue.convertedIssue(issue)}).then(()=>{
		console.log("Issue converted");
		db.collection('issues').findOne({_id: issueId}).then(savedIssue => {
		console.log("issue updated",savedIssue);
		res.json(savedIssue);
		});
		}).catch(error => {
		console.log(error);
		res.status(500).json({message: `Internal server error: ${error}`});
	});
});

app.delete('/api/issues/:id', (req,res)=>{
	console.log("Reached delete API");
	let issueId;
	try{
		issueId = new ObjectId(req.params.id);
	}catch(e){
		res.status(422).json({message: `Invalid issue ID format ${e}`});
		return;
	}
	
	db.collection('issues').deleteOne({_id: issueId}).then(deleteResult => {
		console.log(deleteResult);
		if(deleteResult.deletedCount===1){
			res.json({status: 'OK'});
		} else {
			res.json({status: 'Warning: Object not found'});
		}
	}).catch(err => {
		console.log(err);
		res.status(500).json({message: `Internal server error ${err}`});
	})
});

app.get("*",(req,res)=>{
	console.log("Reached unknown url");
	res.sendFile(path.resolve('static/index.html'));
});

MongoClient.connect('mongodb://127.0.0.1:27017/issuetracker').then(connection => {
	db=connection.db("issuetracker");
	app.listen(3000,function(){
	console.log("App started on port 3000");
});
}).catch(err => {
	console.log('Error', err);
});


