import {
    Button,
    createStyles,
    Title,
    Text,
    TextInput,
    Alert,
    Radio,
    RadioGroup,
    Select,
    Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {  useState } from "react";
import axios from "axios";
import {
    copyShortUrlToClipbord,
    constructShortUrl,
    constructShortUrlWithProtocol,
} from "../common/functions";
import { Tooltip } from "@mantine/core";
import { QRCode } from "react-qrcode-logo";


const useStyles = createStyles(() => ({
    root: {
        "input[type=radio]": {
            margin: 0,
        },
        label: {
            marginBottom: 0,
        },
    },
    input: {
        margin: "10px 0",
    },
    date: {
        margin: "20px 0",
    },
}));

const LinkCreator = ({ title, desc, custom, userMandates, disabled }) => {
    const { classes } = useStyles();
    const [radio, setRadio] = useState("no");
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState({ title: "", message: "" });
    const [result, setResult] = useState("");
    const [copied, setCopied] = useState(false);
    
    const form = useForm({
        initialValues: {
            url: "",
            short: "",
            expire: "",
            mandate: "",
        },

        validate: {
            url: (value) =>
                /^https?:\/\/.*$/.test(value)
                    ? null
                    : "Invalid URL. Should include http:// or https://",
        },
    });

    const submit = async (values) => {
        if (fetching) return;
        setFetching(true);
        setResult("");
        setError("");

        const data = {
            url: values.url,
        };
        if (values.short) data["desired"] = values.short;
        if (radio === "yes" && values.expire)
            data["expires"] = new Date(values.expire).getTime();
        if (values.mandate) data["mandate"] = values.mandate;

        axios
            .post("/api/shorten", data)
            .then((res) => {
                setResult(res.data.short);
                form.reset();
            })
            .catch((err) => {
                if (err.response) {
                    const res = err.response;
                    if (res.status === 401) {
                        setError({
                            title: "401: Unauthorized",
                            message: "Du är inte inloggad",
                        });
                    } else if (res.status === 400) {
                        if (res.data.errors) {
                            const param = err.response.data.errors[0].param;
                            const msg = err.response.data.errors[0].msg;
                            setError({
                                title: "400: Bad Request",
                                message: `${param} ${msg}.`,
                            });
                        }
                    } else {
                        setError({
                            title: `${res.status}: ${res.statusText}.`,
                            message: "",
                        });
                    }
                } else {
                    setError({
                        title: "Hoppsan",
                        message: JSON.stringify(err),
                    });
                }
            })
            .finally(() => setFetching(false));
    };

    const submitDisabled =
        form.values.url.length === 0 ||
        (custom && form.values.short.length === 0) ||
        (radio === "yes" && form.values.expire === "");

    return (
        <div className={classes.root}>
            <Title order={2}>{title}</Title>
            <Text>{desc}</Text>
            {error.title && (
                <Alert title={error.title} color="red">
                    {error.message}
                </Alert>
            )}
            <form onSubmit={form.onSubmit((values) => submit(values))}>
                <TextInput
                    className={classes.input}
                    placeholder="Lång jävla länk"
                    {...form.getInputProps("url")}
                    disabled={fetching || disabled}
                />
                {custom && (
                    <TextInput
                        className={classes.input}
                        placeholder="Önskad förkortad länk, till exempel 'sm-handlingar'"
                        {...form.getInputProps("short")}
                        disabled={fetching || disabled}
                    />
                )}
                <RadioGroup
                    label="Utgångsdatum"
                    value={radio}
                    onChange={setRadio}
                >
                    <Radio
                        value="yes"
                        label="Ja"
                        disabled={fetching || disabled}
                    />
                    <Radio
                        value="no"
                        label="Nej"
                        disabled={fetching || disabled}
                    />
                </RadioGroup>
                <div className={classes.date}>
                    {radio === "yes" && (
                        <input
                            id="expire-time"
                            type="datetime-local"
                            {...form.getInputProps("expire")}
                            disabled={fetching || disabled}
                        />
                    )}
                </div>
                {userMandates.length !== 0 && (
                    <div className={classes.date}>
                        <Text>Koppla länken till ett mandat eller grupp?</Text>
                        <Select
                            label="Framtida funktionärer på posten blir ägare av länken"
                            data={[
                                // You can grant a group ownership
                                ...userMandates
                                    .map((m) => m.Role.Group)
                                    .map((m) => ({
                                        label: `Alla i gruppen "${m.name}"`,
                                        value: m.identifier,
                                        group: "Grupper",
                                    }))
                                    .filter(
                                        (v, i, self) =>
                                            i ===
                                            self.findIndex(
                                                (t) => t.value === v.value
                                            )
                                    ),
                                ...userMandates
                                    .map((m) => ({
                                        label: m.Role.title,
                                        value: m.Role.identifier,
                                        group: m.Role.Group.name,
                                    }))
                                    .sort((a, b) =>
                                        a.label > b.label ? 1 : -1
                                    ),
                            ]}
                            searchable
                            allowDeselect
                            {...form.getInputProps("mandate")}
                            disabled={fetching || disabled}
                            autoComplete="off"
                        />
                    </div>
                )}
                <Button
                    type="submit"
                    disabled={submitDisabled || fetching || disabled}
                >
                    Förkorta
                </Button>
            </form>
            {result && (
                <>
                    <Center>
                        <div>
                            <h3>
                                <a
                                    href={constructShortUrlWithProtocol(result)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {constructShortUrl(result)}
                                </a>
                            </h3>
                        </div>
                    </Center>
                    <Center>
                        <div>
                            <Tooltip
                                label="Kopierat"
                                opened={copied}
                                transition="fade"
                            >
                                <Button
                                    onClick={() => {
                                        copyShortUrlToClipbord(result);
                                        setCopied(true);
                                        setTimeout(
                                            () => setCopied(false),
                                            3000
                                        );
                                    }}
                                    disabled={fetching}
                                >
                                    Kopiera länk
                                </Button>
                            </Tooltip>
                        </div>
                    </Center>
                    <br/>
                    <Center>
                        <QRCode
                            value={constructShortUrl(result)}
                            size={240}
                            level="H"
                            renderAs="canvas"
                            logoImage="/logo.svg"
                            logoWidth={52}
                        />
                    </Center>
                </>
            )}
        </div>
    );
};

export default LinkCreator;
