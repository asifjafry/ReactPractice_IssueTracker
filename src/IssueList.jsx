import IssueAdd from './IssueAdd.jsx';
import IssueFilter from './IssueFilter.jsx';
import React from 'react';
import 'whatwg-fetch';
import {Link,useLocation,useNavigate, useSearchParams, createSearchParams} from 'react-router-dom';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {Trash} from 'react-bootstrap-icons';

export default ()=>{
	let [searchParams,setSearchParams]=useSearchParams();
	
	let props = {
		location: useLocation(),
		navigate: useNavigate(),
		params: Object.fromEntries([...searchParams])
	};
	return (
		<IssueList {...props} />
	);
}

function IssueRow (props){
	function onDeleteClick(){
		props.deleteIssue(props.issue._id);
	}
	
	return (
	<tr>
		<td><Link to={`/issues/${props.issue._id}`}>{props.issue._id.substr(-4)}</Link></td>
		<td>{props.issue.status}</td>
		<td>{props.issue.owner}</td>
		<td>{props.issue.created.toDateString()}</td>
		<td>{props.issue.effort}</td>
		<td>{props.issue.completionDate ? props.issue.completionDate.toDateString() : ""}</td>
		<td>{props.issue.title}</td>
			{/*<td><button onClick={onDeleteClick}>Delete</button></td>*/}
		<td><Button bsSize="xsmall" onClick={onDeleteClick}><Trash /></Button></td>
	</tr>
);
}

IssueRow.propTypes = {
	issue: PropTypes.object.isRequired,
	deleteIssue: PropTypes.func.IsRequired
};	
			

/*class IssueFilter extends React.Component {
	render(){
		return <div>This is place holder for issue filter</div>;
	}
}*/

function IssueTable(props){
	
	const issueRows = props.issues.map((issue) => <IssueRow key={issue._id} issue={issue} deleteIssue={props.deleteIssue} />);
	return (
			<table className="bordered-table">
				<thead>
					<tr>
						<th>Id</th>
						<th>Status</th>
						<th>Owner</th>
						<th>Created</th>
						<th>Effort</th>
						<th>Completion date</th>
						<th>Title</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
				{issueRows}
				</tbody>
			</table>
		);
}

IssueTable.propTypes = {
	issues: PropTypes.array.isRequired,
	deleteIssue: PropTypes.func.isRequired
};

class IssueList extends React.Component {
	constructor(){
		super();
		this.state = {issues: []};
		this.createIssue = this.createIssue.bind(this);
		this.setFilter = this.setFilter.bind(this);
		this.deleteIssue = this.deleteIssue.bind(this);
	}
	
	deleteIssue(id){
		console.log("Reached deleteIssue method");
		fetch(`/api/issues/${id}`, {method: 'DELETE'}).then(response => {
			if(!response.ok){
				alert('Failed to delete issue');
			} else {
				this.loadData();
			}
		})
	}
	
	setFilter(query){
			this.props.navigate({pathname: this.props.location.pathname, search: createSearchParams(query).toString()});
	}
	
	componentDidMount(){
		this.loadData();
	}
	
	componentDidUpdate(prevProps){
		const oldQuery = prevProps.location.search;
		const newQuery = this.props.location.search;
		
		if(oldQuery === newQuery){
			return; 
		}
		
		this.loadData();
	}
	
	loadData(){
		fetch(`api/issues${this.props.location.search}`).then(response => {
				if(response.ok){
				response.json().then(data => {
					data.records.forEach(issue => {
						issue.created = new Date(issue.created);
						if(issue.completionDate){
							issue.completionDate = new Date(issue.completionDate);
						}
					});
					this.setState({issues: data.records});
				})
				} else {
					response.json().then(error => {
						alert("Failed to fetch issues: ", error.message);
					})
				}
			}).catch(err => console.log(err));
	}
	
	createIssue(newIssue){
		fetch('/api/issues',{
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(newIssue)
		}).then(response => {
			if(response.ok){
				response.json().then(updatedIssue => {
					updatedIssue.created = new Date(updatedIssue.created);
					if(updatedIssue.completionDate){
						updatedIssue=completionDate = new Date(updatedIssue.completionDate);
					}
					const newIssues = this.state.issues.concat(updatedIssue);
					this.setState({issues: newIssues});
					})
			} else{
				response.json().then(error => {
					alert("Failed to add issue: " + error.message);
				});
			}
		}).catch(err => console.log("Error in sending data to server: " + err));
	}
		
	render(){
		return (
		<div>
			
			<IssueFilter setFilter={this.setFilter} initFilter={this.props.params}/>
			<hr />
			<IssueTable issues={this.state.issues} deleteIssue={this.deleteIssue}/>
			<hr />
			<IssueAdd createIssue={this.createIssue} />
			<hr />
		</div>
		);
	}
}

IssueList.propTypes = {
		location: PropTypes.object.isRequired,
		router: PropTypes.object
	};