// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CreateOrder from './CreateOrder';
import CentralAdminOrderManagement from './CentralAdminOrderManagement';

const App = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={CreateOrder} />
                <Route path="/admin/orders" component={CentralAdminOrderManagement} />
            </Switch>
        </Router>
    );
};

export default App;
