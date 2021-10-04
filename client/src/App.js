import axios from "axios";
import Methone, { Header } from "methone";
import { useState } from "react";
import './App.css';

const App = () => {

  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const submit = async () => {
    const result = await axios.post("/api/shorten", { url: text }, { headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}})
    if (result.status === 200) {
      setResult(result.data.short)
    } else {

    }
  }

  return (
    <div id="application" className="light-blue">
      <Methone config={{
        system_name: "link-shortener",
        color_scheme: "light-blue",
        links: []
        }}
      />
      <Header title="AA"/>
      <div id="content">
        <input
          type="text"
          placeholder="Lång jävla länk"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button onClick={submit}>Förkorta</button>
        <a href="">{window.location.host}/{result}</a>
      </div>
    </div>
  )
}

export default App;
