# Pico - Länkförkortare
Trött på långa länkar? Då har vi systemet just för dig. Stoppa in din långa länk, klicka på "Förkorta" och vips har du en länk man lätt kommer ihåg.

Systemet är tänkt att endast användas i sektionsrelaterade ändamål för att exempelvis förkorta länkar till formulär och annat.

När man förkortar en länk kollar systemet om länken finns i svartlistan som innehåller länkar till porr, spam, malware etc. [Denna](https://github.com/blocklistproject/Lists/blob/master/everything.txt) lista (90 MB) används.

# API documentation
Available [here](https://duckumentation.datasektionen.se/pico)

# Pls permissions
There are two pls permissions:
- `admin`
- `custom-link`

- `admin` gives you access to manage all links, not only your own
- `custom-link` gives you the right to create custom links.

# Dependencies (Sektionens system)
Pico uses the following systems:

Login2 - login with KTH-account
Pls - to check admin priveleges of users

# Dependencies
- npm
- MongoDB

# Environment variables

To get a login API-key contact <a href="mailto:d-sys@datasektionen.se">d-sys</a>.

## Server
See [configuration.ts](configuration.ts)

| Name                      | Default                                   | Description                                               |
| ------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| MONGO_URL                 | -                                         | Example: `mongodb://localhost:27017/pico`, follow the schema: `mongodb://HOST:PORT/DB_NAME`                                                          |
| PORT                      | 8000                                      | Server port                                               |
| NODE_ENV                  | development                               |                                                           |
| LOGIN_API_URL             | https://login.datasektionen.se            | URL to login                                              |
| LOGIN_API_KEY             | -                                         | Login key                                                 |
| PLS_API_URL               | https://pls.datasektionen.se/api          | URL to pls api                                            |
| SHORT_URL_LENGTH          | 4                                         |                                                           |

## Client

| Name                      | Default                                   | Description                                               |
| ------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| REACT_APP_API_ENDPOINT    | `http://localhost:8080` in development    | Used to fetch the API                                     |
| REACT_APP_LOGIN_API_URL   | `https://login.datasektionen.se`          | Used to fetch the login token                             |

# How to run
## Development
Make sure you use the node version specified in `.nvmrc`.

1. Set up environment variables
1. `nvm use` (you need to run this in each terminal window you open, unless you set the default version to 16.5.0)
1. Run `npm install` in root. Will install dependencies in both server and client.
1. Start database: `npm run dev:db`
1. Run `npm run dev` in project root
1. In another terminal, run `cd client && npm run start`

Server and client will hot reload when changes occurs
