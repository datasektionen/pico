import React, { useEffect, useState } from "react";
import { Header } from "methone";
import axios from "axios";
import LinkCreator from "../components/LinkCreator";

const Shorten = ({ userMandates }) => {

    return (
        <>
            <Header title="Länkförkortare" />
            <div id="content">
                <div style={{ marginBottom: "25px", display: "flex", flexDirection: "column" }}>
                    <p>Trött på långa länkar? Då har vi systemet just för dig. Stoppa in din långa länk, klicka på "Förkorta" och vips har du en länk man lätt kommer ihåg.</p>
                    <p>Du kan testa genom att stoppa in example.com</p>
                    <p><b>Detta system får bara användas i sektionsrelaterade ändamål. Du måste vara inloggad för att kunna förkorta en länk.</b></p>
                    <p>Tänk på vad som finns i länken du förkortar. Se till att länken inte innehåller några personliga tokens eller liknande.</p>
                </div>
                <LinkCreator
                    title="Autogenererad förkortad länk"
                    desc={
                        <>
                            <p>Slumpa en fyra karaktärer lång sträng.</p>
                        </>
                    }
                    userMandates={userMandates}
                />
                <LinkCreator
                    title="Specificera förkortad länk"
                    desc={
                        <>
                            <p>Önska en förkortad länk, exempelvis "ior". Giltiga tecken: A-Ö, a-ö, 0-9</p>
                            <p>Används för exempelvis rekryteringsformulär för nämnder. Du måste vara funktionär för att nyttja denna funktionalitet.</p>
                        </>
                    }
                    custom
                    userMandates={userMandates}
                />
            </div>
        </>
    )
};

export default Shorten;