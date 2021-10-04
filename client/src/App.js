import Methone from "methone";
import React, { useEffect, useState } from "react";
import "./App.css";
import { Redirect, Route, Switch, Link } from "react-router-dom";
import Shorten from "./views/Shorten";
import RedirectComponent from "./views/RedirectComponent";
import Links from "./views/Links";
import useAuthorization from "./hooks/useAuthorization";

const defaultLinks = [
    <Link to="/shorten" key="methonl-1">Förkorta</Link>,
]

export const LoggedInContext = React.createContext({ loading: true, hasToken: false })

const App = () => {

    const [methoneLinks, setMethoneLinks] = useState(defaultLinks)
    const { pls, loading, hasToken } = useAuthorization();

    useEffect(() => {
        if (hasToken) {
            setMethoneLinks([...defaultLinks, <Link to="/links" key="methonl-2">Länkar</Link>])
        } else setMethoneLinks(defaultLinks)
    }, [pls, loading])

    return (
        <div id="application" className="light-blue">
            <LoggedInContext.Provider value={{ loading, hasToken }}>
                <Methone config={{
                    system_name: "link-shortener",
                    login_href: hasToken ? "/logout" : "/login",
                    login_text: hasToken ? "Logga ut" : "Logga in",
                    color_scheme: "light-blue",
                    links: methoneLinks,
                }}
                />
                <Switch>
                    <Route exact path="/shorten">
                        <Shorten />
                    </Route>
                    <Route exact path="/links">
                        <Links />
                    </Route>
                    <Route exact path="/login" render={match => {
                            window.location = `https://login.datasektionen.se/login?callback=${encodeURIComponent(window.location.origin)}/token/`;
                            return <div></div>
                        }} />
                        <Route exact path="/logout" render={({ match }) => {
                            localStorage.removeItem('token')
                            window.location = "/shorten";
                            return <div></div>
                        }} />
                        <Route exact path="/token/:token" render={({ match, history }) => {
                            localStorage.setItem('token', match.params.token);
                            return <Redirect to="/shorten" />
                        }} />
                    <Route>
                        <RedirectComponent />
                    </Route>
                </Switch>
            </LoggedInContext.Provider>
        </div>
    )
}

export default App;
