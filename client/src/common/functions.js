export const copyShortUrlToClipbord = (short) => {
    const value = constructShortUrlWithProtocol(short);
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
};

export const constructShortUrl = (short) => window.location.host + "/" + short;
export const constructShortUrlWithProtocol = (short) =>
    window.location.origin + "/" + short;
