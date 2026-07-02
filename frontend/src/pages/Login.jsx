import { apiUrl } from "../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const login = async () => {

    try {

      const res = await fetch(apiUrl("/login"), {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          password
        })

      });

      const data = await res.json();

      if (data.success) {

        localStorage.setItem("loggedIn", "true");

        navigate("/cover");

      }

      else {

        setError("Wrong password and I'm judging you... silently. 🌸");

      }

    }

    catch (err) {

  console.log(err);

  alert(err.message);

  setError("Unable to connect to notebook.");

}

  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#f8f4ee",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Georgia"
      }}
    >

      <div
        style={{
          width: 430,
          background: "white",
          padding: 40,
          borderRadius: 20,
          boxShadow: "0 10px 35px rgba(0,0,0,.08)"
        }}
      >

        <h1
          style={{
            textAlign: "center",
            marginBottom: 20
          }}
        >
          Top Secret
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#6d5c52",
            marginBottom: 20
          }}
        >
          Enter the correct password.
        </p>

        <p
          style={{
            textAlign: "center",
            marginBottom: 30,
            color: "#9b6f5c"
          }}
        >
          Wrong password and I'm judging you... silently. 🌸
        </p>

        <input

          type="password"

          placeholder="Password"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

          style={{
            width:"100%",
            padding:15,
            borderRadius:10,
            border:"1px solid #ddd",
            fontSize:16
          }}

        />

        {error && (

          <p
            style={{
              color:"crimson",
              marginTop:15,
              textAlign:"center"
            }}
          >
            {error}
          </p>

        )}

        <button

          onClick={login}

          style={{
            width:"100%",
            marginTop:25,
            padding:15,
            borderRadius:10,
            border:"none",
            background:"#9b6f5c",
            color:"white",
            fontSize:18,
            cursor:"pointer"
          }}

        >

          🔓 Unlock Notebook

        </button>

      </div>

    </div>

  );

}