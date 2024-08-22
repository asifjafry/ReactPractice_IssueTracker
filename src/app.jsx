import IssueList from './IssueList.jsx';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Routes,Route,Navigate,useLocation,useNavigate,useParams,Outlet,browserHistory} from 'react-router-dom';
import IssueEdit from './IssueEdit.jsx';
import PropTypes from 'prop-types';
import {Navbar, Nav, NavItem, NavDropdown} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import {Plus,Option} from 'react-bootstrap-icons';



//import IssueAdd from './IssueAdd.jsx';

const contentNode = document.getElementById('contents');

const noMatch = ()=> <p>Page not found.</p>

const MyHeader = () => {
	return (
	 <Navbar className="justify-content-evenly">
		<Navbar.Brand>Issue tracker</Navbar.Brand>
		<Nav className="flex-grow-1 justify-content-evenly">
			<LinkContainer to="/issues">
				<NavItem>Issues</NavItem>
			</LinkContainer>
			<LinkContainer to="/reports">
				<NavItem>Reports</NavItem>
			</LinkContainer>
		</Nav>
		<Nav className="flex-grow-1 justify-content-center">
			<NavItem><Plus />Create issue</NavItem>
			<NavDropdown id="user-dropdown" title={<Option />} noCaret>
				<NavDropdown.Item>Logout</NavDropdown.Item>
			</NavDropdown>
		</Nav>
	 </Navbar>
	);
}

const App = (props) =>{
	console.log("reached app");
	return (
		<div>
		<MyHeader />
			<div className="contents">
				<div className="container-fluid">
					<Outlet />
					<hr />
					<h5><small>
						Full source code available at: <a href="https://github.com/vasansr/pro-mern-stack">Github Repository</a>
					</small></h5>
				</div>
			</div>
		</div>
	);
}

App.propTypes = {
	children: PropTypes.object.isRequired
}

/*function withRouter(Component){
	function ComponentWithRouterProp(props){
		let location = useLocation();
		//let navigate = useNavigate();
		let params = useParams();
		let router = {
			location: location,
			//navigate: navigate,
			params: params
		}
		
		return (
			<Component
			{...props}
			router={router}
			/>
		);
	}
	return ComponentWithRouterProp;
}*/

const RoutedApp = ()=> {
	//let navigate = useNavigate();
	return (
	<Router>
	<Routes>
	<Route path="/" element={<Navigate replace to="issues"/>} />
		<Route path="/" element={<App />}>
			<Route path="issues" element={<IssueList />} />
			<Route path="issues/:id/" element={<IssueEdit />} />
			<Route path="*" element={<noMatch />} />
		</Route>
	</Routes>
	</Router>
	);
};

ReactDOM.render(<RoutedApp />,contentNode);

if(module.hot){
	module.hot.accept();
}