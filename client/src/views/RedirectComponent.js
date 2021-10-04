import React, { useEffect, useState } from "react";
import axios from "axios";
import Configuration from "../configuration";
import { useHistory } from "react-router";
import Spinner from "../spinner.gif";

const RedirectComponent = () => {

    const [initialLoading, setInitialLoading] = useState(true);
    const LINKS = ["/shorten", "/login", "/logout", "/links", "/token"]
    const history = useHistory();

    useEffect(() => {
        if (window.location.pathname === "/") {
            setInitialLoading(false)
            history.push("/shorten")
        }
        if (window.location.pathname.length !== 1 && LINKS.filter(x => x === window.location.pathname).length !== 1) {
            const short = window.location.pathname.split("/")[1]
            axios.get(`${Configuration.apiUrl}/api/code/${short}`)
                .then(res => {
                    console.log(res)
                    // const url = res.data.url
                    // if (!url.startsWith("https://") && !url.startsWith("http://")) {
                    //     window.location = "https://" + res.data.url
                    // } else {
                        window.location = res.data.url
                    // }
                })
                .catch(err => {
                    setInitialLoading(false)
                    history.push("/shorten")
                })
        } else {
            setInitialLoading(false)
            history.push(window.location.pathname)
        }

    }, [])

    if (initialLoading) return (
        <div style={{ display: "flex", justifyContent: "center", "alignItems": "center", height: "100%", width: "100%", backgroundColor: "#fff", zIndex: 100000, top: 0, position: "absolute" }}>
            <img src={Spinner} />
        </div>
    )

    return (
        <div>
            Something is wrong
        </div>
    )
};

export default RedirectComponent;