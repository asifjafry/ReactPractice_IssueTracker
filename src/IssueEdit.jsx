import React from 'react';
import {Link, useParams} from 'react-router-dom';
import PropTypes from 'prop-types';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';

export default (props) => {
	return (<IssueEdit {...props} params={useParams()} />);
}

class IssueEdit extends React.Component{
	
	constructor(){
		super();
		this.state = {
			issue: {
				_id: '', title: '', status: '', owner: '', effort: null, completionDate: null, created: null
			},
			invalidFields: {}
		}
		this.onChange = this.onChange.bind(this);
		this.onValidityChange = this.onValidityChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}
	
	onSubmit(event){
		event.preventDefault();
		if(Object.keys(this.state.invalidFields).length!== 0){
			return;
		}
		console.log(`Id: ${this.state.issue._id} & ${this.props.params._id}`);
		fetch(`/api/issues/${this.state.issue._id}`, {
			method: 'PUT',
			headers: {'Content-Type':'application/json'},
			body: JSON.stringify(this.state.issue)
		}).then(response => {
			console.log(response);
			if(response.ok){
				response.json().then(updatedIssue => {
					updatedIssue.created = new Date(updatedIssue.created);
					if(updatedIssue.completionDate){
						updatedIssue.completionDate = new Date(updatedIssue.completionDate);
					}
					this.setState({issue: updatedIssue});
					alert('Issue updated successfully');
				});
			}else{
				response.json().then(error => {
					alert(`Failed to update issue: ${error}`);
				});
			}
		}).catch(error => {
			alert(`Error in sending data: ${error}`);
		});
	}
	
	onValidityChange(event, valid){
		const invalidFields = Object.assign({},this.state.invalidFields);
		if(!valid){
			invalidFields[event.target.name] = true;
		} else {
			delete invalidFields[event.target.net];
		}
		this.setState({invalidFields});
		
	}
	
	componentDidMount(){
		this.loadData();
	}
	
	componentDidUpdate(prevProps){
		if(prevProps.params.id!==this.props.params.id){
			this.loadData();
		}
	}
	
	onChange(event, convertedValue){
		const issue = Object.assign({},this.state.issue);
		const value = convertedValue!==undefined ? convertedValue : event.target.value;
		//issue[event.target.name] = event.target.value;
		issue[event.target.name] = value;
		console.log(`Status after change: ${issue[event.target.name]}`);
		this.setState({issue});
	}
	
	loadData(){
		fetch(`/api/issues/${this.props.params.id}`).then(response => {
			if(response.ok){
				response.json().then(issue => {
					issue.created = new Date(issue.created);
					issue.completionDate = issue.completionDate != null ? new Date(issue.completionDate) : null;
					this.setState({issue});
				})
			} else {
				response.json().then(error => {
					alert(`Failed to fetch issue: ${error.message}`);
				});
			}
		}).catch(err => {
			alert(`Error in fetching data from server: ${err.message}`);
		})
	}

	render(){
		
		//let id = this.props.params.id;
		const issue = this.state.issue;
		//issue.created=issue.created.toDateString();
		const validationMessage = Object.keys(this.state.invalidFields).length===0 ? null : <div className='error'>Please correct invalid fields values before submit</div>
		return (
			<div>
				<form onSubmit={this.onSubmit}>
					ID: {issue._id}
					<br />
					Created: {(issue.created == null ? '' : issue.created.toDateString())}
					<br />
					Status: <select name='status' value={issue.status} onChange={this.onChange}>
						<option value="New">New</option>
						<option value="Open">Open</option>
						<option value="Assigned">Assigned</option>
						<option value="Fixed">Fixed</option>
						<option value="Verified">Verified</option>
						<option value="Closed">Closed</option>
					</select>
					<br />
					Owner: <input name='owner' value={issue.owner} onChange={this.onChange} />
					<br />
					Effort: <NumInput size={5} name='effort' value={issue.effort} onChange={this.onChange} />
					<br />
					Completion Date: <DateInput name='completionDate' value={issue.completionDate} onChange={this.onChange} onValidityChange={this.onValidityChange} />
					<br />
					Title: <input name='title' value={issue.title} onChange={this.onChange} />
					<br />
					{validationMessage}
					<br />
					<button type='submit'>Submit</button>
				</form>
				<Link to='/issues'>Back to issue list </Link>
			</div>
		);
	}
}

IssueEdit.propTypes = {
	params: PropTypes.object.isRequired,
};