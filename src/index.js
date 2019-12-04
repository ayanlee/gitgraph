import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import Home from './routes/Home.js'
import RepoOverview from './routes/RepoOverview.js'
import GraphPage from './routes/GraphPage.js'
import gitHubApi from './api/GitHubApi.js'
import Topbar from './components/Topbar.js'

export default class Nav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentPage: "home",
      nameValue: '',
      tokenValue: '',
      breadcrumbs: '',
      repos: null,
      nodes: []
    }
  }
  
  nameHandleChange(event) {
    this.setState({nameValue: event.target.value});
  }

  tokenHandleChange(event) {
    this.setState({tokenValue: event.target.value});
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    let repos = null;  
    try{
      if (this.state.nameValue === '' || this.state.tokenValue === null ) {    
        alert('Please enter your github username.')
        return;
      }
      if (this.state.tokenValue === '' || this.state.tokenValue === null) {  
        let alert_repo = 'please provide a github token. You can create one here: \nhttps://github.com/settings/tokens';      
        alert(alert_repo);
        return;        
      }     
      repos = await gitHubApi.getReposByUsername(this.state.nameValue, this.state.tokenValue)
      console.log(repos)
      this.setState({repos, currentPage: 'repos', breadcrumbs: this.state.nameValue + '/repos'})
    } catch(e) {
      console.log(e)
    }
  }

  onCardClicked = async (name) => {
    const jsFiles = await gitHubApi.getFilesByUsernameAndRepoName(this.state.nameValue, name, "", this.state.tokenValue, this.parseNodes.bind(this), this.forceUpdate.bind(this))
    console.log("Done fetchig")
    this.setState({currentPage: 'graph', breadcrumbs: this.state.nameValue + '/repos/' + name})
  }

  forceUpdate () {
    //this.graph.handleFileChange()
  }

  parseNodes (filename, text){
    //console.log(filename, text)
    let nodes = this.state.nodes
    nodes.push({
      filename: filename,
      text: text
    })
    this.graph.handleFileChange(nodes)
    //this.setState({nodes})
  }

  navigateTo(page){
    this.setState({currentPage: page})
  }

  renderPage(){
    switch(this.state.currentPage){
      case("home"): return (
        <Home
        nameHandleChange={this.nameHandleChange.bind(this)}
        tokenHandleChange={this.tokenHandleChange.bind(this)}
        handleSubmit={this.handleSubmit.bind(this)}
        nameValue={this.state.nameValue}
        tokenValue={this.state.tokenValue}
        />
      )
      case("repos"): return <RepoOverview
        repos={this.state.repos}
        onCardClicked={this.onCardClicked.bind(this)}
      />
      case("graph"): return <GraphPage ref={ref => (this.graph = ref)} />
    }
  }

  render() {
    return(
      <div>
        {this.state.currentPage != "home" && <div>
          <Topbar navigateTo={this.navigateTo.bind(this)} breadcrumbs={this.state.breadcrumbs}/>
        </div>}
        {this.renderPage()}
      </div>
    )
  }
}


ReactDOM.render(<Nav />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
