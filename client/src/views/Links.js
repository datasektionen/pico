import axios from "axios";
import { Header } from "methone";
import React, { useEffect, useMemo, useState } from "react";
import Moment from "react-moment";
import { useHistory } from "react-router";
import ItemBrowser from "../components/ItemBrowser";
import { Button, Select, Tooltip, Alert } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { copyShortUrlToClipbord } from "../common/functions";

const sorter = (a, b) => {
    if (a < b) return 1;
    else if (a < b) return -1;
    else return 0;
}

const sortOptions = [
    { label: "Antal klick (fallande)", value: "clicks-desc" },
    { label: "Antal klick (stigande)", value: "clicks-asc" },
    { label: "ID (A-Ö)", value: "id-aö" },
    { label: "ID (Ö-A)", value: "id-öa" },
    { default: true, label: "Skapat (Nyast-Äldst)", value: "created-new-old" },
    { label: "Skapat (Äldst-Nyast)", value: "created-old-new" },
    { label: "Utgångsdatum (Tidigast-Senast)", value: "expire-new-old" },
    { label: "Utgångsdatum (Senast-Tidigast)", value: "expire-old-new" },
];

const Links = ({ user, userMandates, allMandates, pls }) => {

    const [fetchingLinks, setFetchingLinks] = useState(true);
    const [allLinks, setAllLinks] = useState([]);
    const [links, setLinks] = useState([]);
    const [query, setQuery] = useState("");
    const history = useHistory();
    const [filterOption, setFilterOption] = useState("");
    const [filterMandateOption, setFilterMandateOption] = useState("");
    const [filterUserOption, setFilterUserOption] = useState("");
    const [sortOption, setSortOption] = useState(sortOptions.find(s => s.default).value);
    const [debouncedQuery] = useDebouncedValue(query, 500)
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState("");

    const filterOptions = useMemo(() => {
        return [
            {
                label: "Mina länkar",
                value: "my-links",
                filter: (link, user, mandates) => link.user === user || mandates.includes(link.mandate),
            },
            {
                label: "Med utgångsdatum",
                value: "has-expire-date",
                filter: (link, _, __) => link.expires,
            },
            ...userMandates.map(m => ({
                label: `Tillhör "${m.Role.title}"`,
                value: m.Role.identifier,
                filter: (link, user, mandates) => mandates.includes(link.mandate),
            })),
        ]
    }, [userMandates, user])

    const fetchAll = () => {
        axios.get("/api/all")
            .then(res => {
                setAllLinks(res.data)
            })
            .catch(err => {

            })
            .finally(() => setFetchingLinks(false));
    }

    useEffect(fetchAll, [])

    // I am lazy
    // You can still manually set a token and go to /links
    if (!localStorage.getItem("token")) history.push("/shorten")

    const removeLinks = (links) => {
        setDeleting(true)
        Promise.all(links.map(l => {
            return axios.delete(`/api/${l}`)
        }))
            .then(res => {
                setAllLinks(allLinks.filter(x => !links.includes(x.short)))
            })
            .catch(res => {
                setError(res.toString());
            })
            .finally(() => setDeleting(false))
    }

    const matchesSearch = (x) => {
        return x.url.toLowerCase().match(new RegExp(debouncedQuery.toLowerCase(), "g")) !== null
    }

    useEffect(() => {
        const filterFn = filterOptions.find(x => x.value === filterOption)?.filter ?? ((value) => true);

        let sortFn = (a, b) => sorter(a.date, b.date);
        if (sortOption === "id-aö") sortFn = (a, b) => a.short < b.short ? -1 : 1;
        else if (sortOption === "id-öa") sortFn = (a, b) => a.short < b.short ? 1 : -1;
        else if (sortOption === "created-new-old") sortFn = (a, b) => a.date < b.date ? 1 : -1;
        else if (sortOption === "created-old-new") sortFn = (a, b) => a.date < b.date ? -1 : 1;
        else if (sortOption === "expire-new-old") sortFn = (a, b) => (a.expires ?? "") < (b.expires ?? "") ? -1 : 1;
        else if (sortOption === "expire-old-new") sortFn = (a, b) => (a.expires ?? "") < (b.expires ?? "") ? 1 : -1;
        else if (sortOption === "clicks-asc") sortFn = (a, b) => a.clicks < b.clicks ? -1 : 1;
        else if (sortOption === "clicks-desc") sortFn = (a, b) => a.clicks < b.clicks ? 1 : -1;

        const filtered = allLinks
            .filter(x => filterFn(x, user, userMandates.map(m => m.Role.identifier)))
            .filter(x => filterMandateOption === "" ? true : (filterMandateOption === x.mandate))
            .filter(x => filterUserOption === "" ? true : (filterUserOption === x.user))
            .filter(matchesSearch)
            .sort(sortFn)

        setLinks(filtered)
    }, [sortOption, filterOption, filterMandateOption, filterUserOption, allLinks, debouncedQuery])

    const linksAsItems = useMemo(() => {
        return links.map(l => ({
            ...l,
            url: (
                <Tooltip label={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">{l.url}</a>
                </Tooltip>
            ),
            description: (
                <Tooltip wrapLines width={300} position="right" label={l.description ?? "Ingen beskrivning"}>
                    {l.description ?? "-"}
                </Tooltip>
            ),
            date: (
                <Tooltip label={
                    <Moment format="YYYY-MM-DD HH:mm:ss">
                        {l.date}
                    </Moment>
                }>
                    <Moment format="YYYY-MM-DD HH:mm:ss">
                        {l.date}
                    </Moment>
                </Tooltip>
            ),
            expires: (
                l.expires ? (
                    <Tooltip label={
                        <Moment format="YYYY-MM-DD HH:mm:ss">
                            {l.expires}
                        </Moment>
                    }>
                        <Moment format="YYYY-MM-DD HH:mm:ss">
                            {l.expires}
                        </Moment>
                    </Tooltip>
                ) : "-"
            ),
            action: (
                <>
                    <Button
                        style={{ padding: "5px", height: "initial" }}
                        onClick={() => copyShortUrlToClipbord(l.short)}
                    >
                        Kopiera
                    </Button>
                </>
            )
        }));
    }, [links])

    return (
        <>
            <Header title="Länkar" />
            <div id="content">
                {error && <Alert color="red">{error}</Alert>}
                <ItemBrowser
                    items={linksAsItems}
                    query={query}
                    setQuery={setQuery}
                    loading={fetchingLinks}
                    onDelete={removeLinks}
                    deleting={deleting}
                    filterDropdowns={
                        <>
                            <Select
                                data={filterOptions.map(f => ({ label: f.label, value: f.value }))}
                                allowDeselect
                                onChange={(value) => setFilterOption(value)}
                                value={filterOption}
                                placeholder="Filtrera"
                            />
                            <Select
                                data={sortOptions.map(f => ({ label: f.label, value: f.value }))}
                                onChange={(value) => setSortOption(value)}
                                value={sortOption}
                                placeholder="Sortera"
                                defaultValue={sortOptions.find(x => x.default).value}
                            />
                            {(pls.includes("admin") || pls.includes("view")) &&
                                <>
                                    <Select
                                        placeholder="Tillhör användare"
                                        searchable
                                        allowDeselect
                                        nothingFound="Hittade inga användare"
                                        data={allLinks.map(i => ({ value: i.user, label: i.user })).filter((v, i, self) => i === self.findIndex(t => t.value === v.value))}
                                        onChange={(value) => setFilterUserOption(value ?? "")}
                                    />
                                    <Select
                                        placeholder="Tillhör mandat"
                                        searchable
                                        allowDeselect
                                        nothingFound="Hittade inga mandat"
                                        data={allMandates.map(m => ({ value: m.identifier, label: m.title }))}
                                        onChange={(value) => setFilterMandateOption(value ?? "")}
                                    />

                                </>
                            }
                        </>
                    }
                />
            </div>
        </>
    )
}

export default Links