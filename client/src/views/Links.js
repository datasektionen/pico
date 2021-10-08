import axios from "axios";
import { Header } from "methone";
import React, { useEffect, useState } from "react";
import Configuration from "../configuration";
import "./Links.css"
import Moment from "react-moment";
import useSortableData from "../hooks/useSortableData";
import { useHistory } from "react-router";
import Spinner from "../spinner.gif";
import { copyShortUrlToClipbord } from "../common/functions";

const Links = () => {

    const [fetchingLinks, setFetchingLinks] = useState(true);
    const [links, setLinks] = useState([]);
    const [query, setQuery] = useState("");
    const history = useHistory();

    const fetchAll = () => {
        axios.get(`${Configuration.apiUrl}/api/all`, {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}})
        .then(res => {
            setLinks(res.data)
        })
        .catch(err => {

        })
        .finally(() => setFetchingLinks(false));
    }

    useEffect(fetchAll, [])

    // I am lazy
    // You can still manually set a token and go to /links
    if (!localStorage.getItem("token")) history.push("/shorten")

    const remove = (short) => {
        axios.delete(`${Configuration.apiUrl}/api/${short}`, {headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}})
        .then(res => {
            // Remove it from list
            setLinks(links.filter(x => x.short !== short))
        })
        .catch(err => {

        })
    }

    const matchesSearch = (x) => {
        return x.short.toLowerCase().match(new RegExp(query.toLowerCase(), "g")) !== null
        || x.url.toLowerCase().match(new RegExp(query.toLowerCase(), "g")) !== null
        || x.user.toLowerCase().match(new RegExp(query.toLowerCase(), "g")) !== null
    }

    const { items, requestSort, sortConfig } = useSortableData(links, { key: "date", direction: "desc" })
    const getAscDesc = (name) => sortConfig.key === name ? sortConfig.direction : "asc";

    return (
        <>
            <Header title="Länkar"/>
            <div id="content" className="Links">
                <div className="search">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Sök id, URL eller användare"
                    />
                </div>
                {fetchingLinks ?
                    <div style={{margin: "auto"}}>
                        <img src={Spinner} />
                    </div>
                    :
                    <div className="table">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        Id
                                        <i
                                            className="fas fa-sort-down"
                                            onClick={() => requestSort("short")}
                                            style={{transform: `rotate(${getAscDesc("short") === "asc" ? "0deg" : "180deg"})`}}
                                        />
                                    </th>
                                    <th>
                                        Pekar på
                                        <i
                                            className="fas fa-sort-down"
                                            onClick={() => requestSort("url")}
                                            style={{transform: `rotate(${getAscDesc("url") === "asc" ? "0deg" : "180deg"})`}}
                                        />
                                    </th>
                                    <th>
                                        Skapat den
                                        <i
                                            className="fas fa-sort-down"
                                            onClick={() => requestSort("date")}
                                            style={{transform: `rotate(${getAscDesc("date") === "asc" ? "0deg" : "180deg"})`}}
                                        />
                                    </th>
                                    <th>
                                        Skapare
                                        <i
                                            className="fas fa-sort-down"
                                            onClick={() => requestSort("user")}
                                            style={{transform: `rotate(${getAscDesc("user") === "asc" ? "0deg" : "180deg"})`}}
                                        />
                                    </th>
                                    <th>
                                        Antal klick
                                        <i
                                            className="fas fa-sort-down"
                                            onClick={() => requestSort("clicks")}
                                            style={{transform: `rotate(${getAscDesc("clicks") === "asc" ? "0deg" : "180deg"})`}}
                                        />
                                    </th>
                                    <th>Aktion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.filter(x => matchesSearch(x)).map(l =>
                                    <tr key={l._id} className="item">
                                        <td>{l.short}</td>
                                        <td><a href={l.url} target="_blank" rel="noopener noreferrer">{l.url}</a></td>
                                        <td>
                                            <Moment format="YYYY-MM-DD HH:mm:ss">
                                                {l.date}
                                            </Moment>
                                        </td>
                                        <td>{l.user}</td>
                                        <td>{l.clicks}</td>
                                        <td id="trash">
                                            <i
                                                className="far fa-copy"
                                                title="Kopiera"
                                                onClick={() => copyShortUrlToClipbord(l.short)}
                                            />
                                            <i
                                                className="fas fa-trash-alt"
                                                title="Ta bort"
                                                onClick={() => remove(l.short)}
                                            />
                                        </td>
                                    </tr>    
                                )}
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </>
    )
}

export default Links