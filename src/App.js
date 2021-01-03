import './App.css';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import { Redirect } from 'react-router-dom'
import SignUp from './components/auth/Signup'
import Login from './components/auth/Login'
import Dashboard from './components/Dashboard'
import PrivateRoute from './components/PrivateRoute'

const App = () => {

  return (
      <Router>
        <Switch>
          <PrivateRoute exact path ="/" component = {Dashboard}/>
          <Route path = "/signup" component = {SignUp} />
          <Route path = "/login" component = {Login} />
        </Switch>
      </Router>
  );
}


export default App;
