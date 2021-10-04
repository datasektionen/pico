import React, { useState, useEffect } from "react";
import { Header } from "methone";
import axios from "axios";
import Configuration from "../configuration";

const Shorten = () => {
    const [text, setText] = useState("");
    const [result, setResult] = useState("");
    const [error, setError] = useState("");
    const [initialLoading, setInitialLoading] = useState(true);
    const [fetching, setFetching] = useState(false)

    const submit = async (e) => {
        e.preventDefault();
        if (fetching) return;
        setFetching(true);
        setError("")
        axios.post(`${Configuration.apiUrl}/api/shorten`, { url: text }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
            .then(res => {
                setResult(res.data.short)
                setError("")
            })
            .catch(err => {
                if (err.response) {
                    const res = err.response
                    if (res.status === 401) {
                        setError("401: Unauthorized")
                    } else if (res.status === 400) {
                        if (res.data.errors) {
                            const param = err.response.data.errors[0].param
                            const msg = err.response.data.errors[0].msg
                            setError(`${param} ${msg}.`)
                        }
                    } else {
                        setError(`${res.status}: ${res.statusText}.`)
                    }
                } else {
                    setError(JSON.stringify(err))
                }
            })
            .finally(() => setFetching(false));
    }

    const copy = () => {
        const value = constructShortUrl()
        // Chrome
        if (navigator.clipboard) {
            navigator.clipboard.writeText(value);
        } else {
            const text = document.createElement("input");
            text.value = value;
            document.body.appendChild(text);
            text.select();
            document.execCommand("copy");
            text.remove();
        }
    }

    const constructShortUrl = () => window.location.host + "/" + result;
    const constructShortUrlProtocol = () => window.location.origin + "/" + result;

    return (
        <>
            <Header title="Länkförkortare" />
            <div id="content">
                {error.length !== 0 &&
                    <div className="alert alert-danger">
                        {error}
                    </div>
                }
                <div className="center">
                    <div style={{ marginBottom: "25px", display: "flex", flexDirection: "column" }}>
                        <p>Trött på långa länkar? Då har vi systemet just för dig. Stoppa in din långa länk, klicka på "Förkorta" och vips har du en länk man lätt kommer ihåg.</p>
                        <p>Du kan testa genom att stoppa in example.com</p>
                        <p><b>Detta system får bara användas i sektionsrelaterade ändamål. Du måste vara inloggad för att kunna förkorta en länk.</b></p>
                        <p>Tänk på vad som finns i länken du förkortar. Se till att länken inte innehåller några personliga tokens eller liknande.</p>
                    </div>
                    <form className="row">
                        <input
                            type="text"
                            placeholder="Lång jävla länk"
                            value={text}
                            onChange={e => setText(e.target.value)}
                        />
                        <button onClick={submit}>Förkorta</button>
                    </form>
                    <div className="shortened row">
                        {result &&
                            <div className="column">
                                <div>
                                    <h3><a href={constructShortUrlProtocol()} target="_blank" rel="noopener noreferrer">{constructShortUrl()}</a></h3>
                                </div>
                                <div>
                                    <button onClick={copy} disabled={fetching}>Kopiera</button>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
};

export default Shorten;