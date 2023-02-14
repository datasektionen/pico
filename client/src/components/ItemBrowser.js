// Taken from https://github.com/datasektionen/dAlumn-frontend/blob/8284726dd127b0ee521759b44a7e41548c55253f/src/components/ItemBrowser/index.tsx
import { Button, createStyles, TextInput } from "@mantine/core";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Text, Center, Pagination, Select } from "@mantine/core";
import Spinner from "../spinner.gif";
import DataGrid, { SelectColumn } from "react-data-grid";

const breakpoints = {
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1100,
    xl: 1400,
};

const columns = [
    SelectColumn,
    { key: "short", name: "ID" },
    { key: "url", name: "Pekar på" },
    { key: "description", name: "Beskrivning" },
    { key: "date", name: "Skapat den" },
    { key: "expires", name: "Utgångsdatum" },
    { key: "clicks", name: "Antal klick" },
    { key: "user", name: "Skapare" },
    { key: "mandate", name: "Mandat" },
    { key: "action", name: "Aktion" },
];

const maxWidth = (bp) => `@media (max-width: ${breakpoints[bp]}px)`;

const useStyles = createStyles((theme, _params, getRef) => {
    return {
        root: {
            padding: "5px 20px",
            [maxWidth("sm")]: {
                padding: "5px 0px",
            },
        },
        filter: {
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            [maxWidth("sm")]: {
                flexDirection: "column",
            },
        },
        filterDropdowns: {
            display: "flex",
            [maxWidth("sm")]: {
                flexDirection: "column",
                "> div": {
                    maxWidth: "100%",
                },
            },
        },
        content: {},
        pagination: {
            padding: "20px 0px 0px",
        },
        resultsPerPage: {
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            [maxWidth("xs")]: {
                justifyContent: "center",
                "> *": {
                    width: "100%",
                },
            },
        },
    };
});

/**
 * Component to render data with pagination. Supports list and cards aswell as custom components.
 */
const ItemBrowser = ({
    filterDropdowns,
    items,
    loading = false,
    defaultItemsPerPage,
    query = "",
    setQuery = () => {},
    noItemsString,
    disableTopbar = false,
    disableItemsPerPagePicker = false,
    onDelete,
    deleting,
}) => {
    const { classes } = useStyles();

    const [itemsOnCurrentPage, setItemsOnCurrentPage] = useState([]);
    const _items = useMemo(() => items, [items]);
    const [page, setPage] = useState(1);
    const [ITEMS_PER_PAGE, setItemsPerPage] = useState(
        defaultItemsPerPage ?? 10
    );
    const [selectedRows, setSelectedRows] = useState(() => new Set());

    useEffect(() => {
        const low = (page - 1) * ITEMS_PER_PAGE;
        const high = low + ITEMS_PER_PAGE;
        setItemsOnCurrentPage(_items.slice(low, high));
    }, [page, _items, ITEMS_PER_PAGE]);

    const numPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const oldNumPages = useRef(numPages);

    useEffect(() => {
        setSelectedRows(new Set([]));
    }, [items]);

    // Go to page numPages when number of pages becomes less than the current one.
    // Compares the oldNumPages value to the current one. If oldNumPages is greater, set current page to numPages.
    useEffect(() => {
        // old value is greater than current one, set page to #pages
        if (oldNumPages.current > numPages) setPage(Math.max(1, numPages));
        // Update old value any time it differs from current value
        if (oldNumPages.current !== numPages) {
            oldNumPages.current = numPages;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numPages]);

    return (
        <div className={classes.root}>
            <div className={classes.filter}>
                <div>
                    <TextInput
                        value={query}
                        // onClear={() => setQuery("")}
                        onChange={(event) =>
                            setQuery(event.currentTarget.value)
                        }
                        placeholder="Sök URL:er"
                    />
                </div>
                <div className={classes.filterDropdowns}>{filterDropdowns}</div>
            </div>
            <div className={classes.content}>
                {!loading && itemsOnCurrentPage.length === 0 ? (
                    <Center style={{ height: "200px" }}>
                        <Text color="dimmed">
                            {noItemsString ?? "Inga resultat"}
                        </Text>
                    </Center>
                ) : (
                    <>
                        {!disableTopbar && (
                            <span
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Text size="xl" weight="bold" component="span">
                                    {_items.length} resultat
                                </Text>
                                <Text size="xl" weight="bold" component="span">
                                    Sida {page} av {numPages}
                                </Text>
                            </span>
                        )}
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}
                        >
                            <DataGrid
                                style={{ height: "100%" }}
                                columns={columns}
                                rows={itemsOnCurrentPage}
                                selectedRows={selectedRows}
                                onSelectedRowsChange={setSelectedRows}
                                rowKeyGetter={(row) => row.short.props.children}
                            />
                        </div>
                    </>
                )}
                {loading && (
                    <Center style={{ height: "100px" }}>
                        <img src={Spinner} />
                    </Center>
                )}
            </div>
            <div style={{ margin: "10px 0" }}>
                <Button
                    color="red"
                    disabled={selectedRows.size === 0}
                    loading={deleting}
                    onClick={() => onDelete([...selectedRows])}
                >
                    Radera ({selectedRows.size} st)
                </Button>
            </div>
            {!loading && _items.length !== 0 && (
                <div className={classes.pagination}>
                    {numPages !== 1 && (
                        <Center>
                            <Pagination
                                boundaries={2}
                                withEdges
                                total={numPages}
                                page={page}
                                onChange={setPage}
                            />
                        </Center>
                    )}
                    {!disableItemsPerPagePicker && (
                        <div className={classes.resultsPerPage}>
                            <Select
                                data={[
                                    { value: "5", label: "5" },
                                    { value: "10", label: "10" },
                                    { value: "25", label: "20" },
                                    { value: "50", label: "50" },
                                    { value: "100", label: "100" },
                                    {
                                        value: `${_items.length}`,
                                        label: "Alla",
                                    },
                                ]}
                                onChange={(str) =>
                                    setItemsPerPage(parseInt(str ?? "10"))
                                }
                                label="Resultat per sida"
                                defaultValue="10"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ItemBrowser;
