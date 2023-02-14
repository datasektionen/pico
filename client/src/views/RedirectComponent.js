import React, { useEffect, useState } from "react";
import axios from "axios";
import Configuration from "../configuration";
import { useHistory } from "react-router";
import Spinner from "../spinner.gif";
import { Header } from "methone";
import { Link } from "react-router-dom";

const RedirectComponent = () => {
    const [initialLoading, setInitialLoading] = useState(true);
    const LINKS = ["/shorten", "/login", "/logout", "/links", "/token"];
    const history = useHistory();
    const [error, setError] = useState(false);

    useEffect(() => {
        if (window.location.pathname === "/") {
            setInitialLoading(false);
            history.push("/shorten");
        }
        if (
            window.location.pathname.length !== 1 &&
            LINKS.filter((x) => x === window.location.pathname).length !== 1
        ) {
            const short = window.location.pathname.split("/")[1];
            axios
                .get(`/api/code/${short}`)
                .then((res) => {
                    window.location = res.data.url;
                })
                .catch((err) => {
                    setInitialLoading(false);
                    setError(true);
                });
        } else {
            setInitialLoading(false);
            history.push(window.location.pathname);
        }
    }, []);

    if (initialLoading)
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    width: "100%",
                    backgroundColor: "#fff",
                    zIndex: 100000,
                    top: 0,
                    position: "absolute",
                }}
            >
                <img src={Spinner} />
            </div>
        );

    if (error)
        return (
            <>
                <Header title="404 Not Found" />
                <div style={{ margin: "150px 0" }}>
                    <div style={{ textAlign: "center" }}>
                        <h2>Det där gick ju inte så bra :(</h2>
                        <p>
                            Länken du försökte använda finns inte, eller så har
                            den gått ut eller tagits bort.
                        </p>
                        <p>
                            Om du tror att något är fel, kontakta den som äger
                            länken. Alternativt kan du mejla{" "}
                            <a href="mailto:d-sys@datasektionen.se">
                                systemansvarig
                            </a>
                            .
                        </p>
                        <Link to="/shorten">Hem</Link>
                    </div>
                </div>
            </>
        );

    return <div>Something is wrong</div>;
};

export default RedirectComponent;
