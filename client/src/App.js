import Methone from "methone";
import React, { useEffect, useState } from "react";
import "./App.css";
import { Redirect, Route, Switch, Link } from "react-router-dom";
import Shorten from "./views/Shorten";
import RedirectComponent from "./views/RedirectComponent";
import Links from "./views/Links";
import useAuthorization from "./hooks/useAuthorization";
import axios from "axios";
import Configuration from "./configuration";
import { MantineProvider } from '@mantine/core';

axios.defaults.baseURL = Configuration.apiUrl;
axios.defaults.headers.post["Content-Type"] = "application/json"
axios.interceptors.request.use(
    config => {
        if (!config.headers.Authorization) {
            const token = localStorage.getItem("token");
            if (token) config.headers.Authorization = `Bearer ${token}`
        }

        return config;
    },
    error => Promise.reject(error),
)

const defaultLinks = [
    <Link to="/shorten" key="methonl-1">Förkorta</Link>,
]

const App = () => {

    const [methoneLinks, setMethoneLinks] = useState(defaultLinks)
    const { pls, loading, hasToken, user } = useAuthorization();

    useEffect(() => {
        if (hasToken) {
            setMethoneLinks([...defaultLinks, <Link to="/links" key="methonl-2">Länkar</Link>])
        } else setMethoneLinks(defaultLinks)
    }, [pls, loading])

    const [userMandates, setUserMandates] = useState([])
    const [allMandates, setallMandates] = useState([])
    const [allGroups, setAllGroups] = useState([])

    const getUserMandates = () => {
        if (user.length === 0) return;
        axios.get(`https://dfunkt.datasektionen.se/api/user/kthid/${user}/current`, { headers: { Authorization: "" } })
            .then(res => {
                setUserMandates(res.data.mandates);
            })
            .catch(console.log)
    }

    const getAllMandates = () => {
        axios.get("https://dfunkt.datasektionen.se/api/roles", { headers: { Authorization: "" } })
            .then(res => {
                setallMandates(res.data);
            })
            .catch(console.log)
    }

    const getAllGroups = () => {
        axios.get("https://dfunkt.datasektionen.se/api/groups/all", { headers: { Authorization: "" } })
            .then(res => {
                setAllGroups(res.data);
            })
            .catch(console.log)
    }

    useEffect(getUserMandates, [user])
    useEffect(getAllMandates, [])
    useEffect(getAllGroups, [])

    return (
        <MantineProvider
            theme={{
                fontFamily: "Lato",
                headings: { fontFamily: "Lato" },
                primaryColor: "blue"
            }}
        >
            <div id="application" className="light-blue">
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
                        <Shorten userMandates={userMandates} />
                    </Route>
                    <Route exact path="/links">
                        <Links user={user} userMandates={userMandates} allMandates={allMandates} pls={pls} allGroups={allGroups} />
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
            </div>
        </MantineProvider>
    )
}

export default App;
