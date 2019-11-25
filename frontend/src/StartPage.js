import React, { Component } from 'react';
import { Button, Row, Col, Container, Form } from 'react-bootstrap';

export default class StartPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			maxIterations: 0,
			typeChoice: 'iterations',
			data: null,
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

    requestData = async () => {
		let response = null;
		if (this.state.typeChoice === 'iterations') {
			response = await fetch(`http://localhost:1337/getXIterations/${this.state.maxIterations}`);
		} else if (this.state.typeChoice === 'assignments') {
			response = await fetch(`http://localhost:1337/getAllAssignments`);
		} else if (this.state.typeChoice === 'hierarchical') {
			response = await fetch(`http://localhost:1337/getHierarchicalClustering`);
		}
        
		if (response !== null) {
			let body = await response.json();
			this.setState({data : body})
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
				<Form>	
						<Button style={{marginRight: 10}} onClick={() => this.setMaxIterations(this.state.maxIterations-1)}>{'<'}</Button>
							{'Max Iterations: ' + this.state.maxIterations}
						<Button style={{marginLeft: 10}} onClick={() => this.setMaxIterations(this.state.maxIterations+1)}>{'>'}</Button>
				</Form>

                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
                <Button onClick={this.requestData}>Send Request to Server</Button>
                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
			</>
		)
	}
    
	render() {
		return (
			<Container>
				{this.renderAll()}
				{this.state.data ? console.log(this.state.data) : <Row></Row>}
			</Container>
		);
	}
}

