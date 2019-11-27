import React, { Component } from 'react';
import { Button, Row, Col, Container, Form, Spinner } from 'react-bootstrap';
import TreeGenerator from './TreeGenerator'
const {parse, stringify} = require('flatted/cjs')


export default class StartPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			maxIterations: 0,
			typeChoice: 'iterations',
			tree: null,
			isLoading: false,
		};
	}

	async componentDidMount() {

  
	}

	

	handleTypeChange = async (event) => {
		const choice = event.target.value
		this.setState({typeChoice: choice})
	}
	
 	setMaxIterations = (size)  => {
		if (size < 0) {
			size = 0;
		}
		this.setState({maxIterations: size})
	}

	generateTreeSection = (root) => {
		console.log(root)
		let rootNode = {key: root.id, title: root.blog.Blog || root.id, children:[]}
		let leftBranch = {}
		if (root.left) {
			leftBranch = this.generateTreeSection(root.left)
		}
		let rightBranch = {}
		if (root.right) {
			rightBranch = this.generateTreeSection(root.right)
		}
		rootNode.children.push(leftBranch)
		rootNode.children.push(rightBranch)
		return rootNode;
	}

    requestData = async () => {
		this.setState({isLoading: true})
		let response = null;
		if (this.state.typeChoice === 'iterations') {
			response = await fetch(`http://localhost:1337/getXIterations/${this.state.maxIterations}`);
		} else if (this.state.typeChoice === 'assignments') {
			response = await fetch(`http://localhost:1337/getAllAssignments`);
		} else if (this.state.typeChoice === 'hierarchical') {
			response = await fetch(`http://localhost:1337/getHierarchicalClustering`);
		}
        
		if (response !== null) {
			let tree = [];
			if (this.state.typeChoice === 'hierarchical') {
				let parsedResponse = await response.json();
				tree = this.generateTreeSection(parsedResponse[0])
			}
			if (this.state.typeChoice === 'iterations' || this.state.typeChoice === 'assignments') {
				let body = await response.json();
				for (let key in body) {
					let cluster = {key: 'key' + key, title: 'cluster ' + key, children:[]} 
					let clusterArray = body[key]
					let count = 0;
				for (let key2 in clusterArray) {
					if (clusterArray[key2]) {
						count++;
						let blog = {key: 'key' + key2, title: 'Blog: ' + clusterArray[key2].Blog, children:[]}
						cluster.children.push(blog)
					}
				}
				cluster.title += ` (${count})`
				tree.push(cluster)
			}
			}
			this.setState({tree : tree, isLoading: false})
		}
	}



	renderAll = () => {
		return (
			<>
			<Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
                <Row>Choose the way to compare the blogs</Row>
                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
				<Form>
					Choose Mode:
					<Form.Control defaultValue={this.state.typeChoice} as="select" onChange={this.handleTypeChange} style={{ width: 200 }}>
						<option>iterations</option>
                        <option>assignments</option>
                        <option>hierarchical</option>
		            </Form.Control>
				</Form>
				<Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
				{this.state.typeChoice === 'iterations' ? 
					<Form>	
						<Button style={{marginRight: 10}} onClick={() => this.setMaxIterations(this.state.maxIterations-1)}>{'<'}</Button>
							{'Max Iterations: ' + this.state.maxIterations}
						<Button style={{marginLeft: 10}} onClick={() => this.setMaxIterations(this.state.maxIterations+1)}>{'>'}</Button>
					</Form> : <></>}
                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
                {this.state.isLoading ? 
				<Button variant="primary" disabled>
    				<Spinner
      					as="span"
      					animation="grow"
      					size="sm"
      					role="status"
      					aria-hidden="true"
    				/>
    				Loading...
  				</Button>: <Button onClick={this.requestData}>Send Request to Server</Button>}
                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
			</>
		)
	}
    
	render() {
		return (
			<Container>
				{this.renderAll()}
				{this.state.tree ? <TreeGenerator tree={this.state.tree}></TreeGenerator> : <Row></Row>}
			</Container>
		);
	}
}

