import React, { useState } from "react";
import { Header } from "methone";
import axios from "axios";
import Configuration from "../configuration";
import Spinner from "../spinner.gif";
import { copyShortUrlToClipbord, constructShortUrl, constructShortUrlWithProtocol } from "../common/functions";

const Shorten = () => {
    const [text, setText] = useState("");
    const [desired, setDesired] = useState("");
    const [result, setResult] = useState("");
    const [error, setError] = useState("");
    const [fetching, setFetching] = useState(false)

    const reset = () => {
        setError("")
        setResult("")
    }

    const submit = async (e, hasDesired = false) => {
        e.preventDefault();
        if (fetching) return;
        setFetching(true);
        reset()

        const data = hasDesired ?
            { url: text, desired }
            :
            { url: text };

        axios.post(`${Configuration.apiUrl}/api/shorten`, data, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
        .then(res => {
            setResult(res.data.short)
            setDesired("")
            setText("")
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

    return (
        <>
            <Header title="Länkförkortare" />
            <div id="content">
                {error.length !== 0 &&
                    <div className="alert alert-danger" style={{wordBreak: "break-all"}}>
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
                    <h2>Autogenererad förkortad länk</h2>
                    <p>Slumpa en fyra karaktärer lång sträng.</p>
                    <form className="row">
                        <input
                            type="text"
                            placeholder="Lång jävla länk"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            autoFocus
                        />
                        <button onClick={submit}>Förkorta</button>
                    </form>
                    <h2>Specificera förkortad länk</h2>
                    <p>Önska en förkortad länk, exempelvis "ior". Giltiga tecken: A-Z, a-z, 0-9</p>
                    <p>Används för exempelvis rekryteringsformulär för nämnder. Du måste vara funktionär för att nyttja denna funktionalitet.</p>
                    <form className="row">
                        <input
                            type="text"
                            placeholder="Lång jävla länk"
                            value={text}
                            onChange={e => setText(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Önskad förkortad länk"
                            value={desired}
                            onChange={e => setDesired(e.target.value)}
                        />
                        <button onClick={e => submit(e, true)}>Förkorta</button>
                    </form>
                    {fetching &&
                        <div style={{margin: "auto", padding: "50px"}}>
                            <img src={Spinner} />
                        </div>
                    }
                    <div className="shortened row">
                        {result &&
                            <div className="column">
                                <div>
                                    <h3><a href={constructShortUrlWithProtocol(result)} target="_blank" rel="noopener noreferrer">{constructShortUrl(result)}</a></h3>
                                </div>
                                <div>
                                    <button onClick={() => copyShortUrlToClipbord(result)} disabled={fetching}>Kopiera</button>
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