import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;
    await addDoc(collection(db, "messages"), {
      text: input,
      uid: user.uid,
      name: user.displayName,
      timestamp: new Date()
    });
    setInput("");
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      {!user ? (
        <button onClick={login}>Login with Google</button>
      ) : (
        <div>
          <button onClick={logout}>Logout</button>
          <h2>Welcome {user.displayName}</h2>
          <div style={{ border: "1px solid #ccc", height: 300, overflowY: "auto", marginBottom: 10 }}>
            {messages.map((m, i) => (
              <div key={i}>
                <b>{m.name}:</b> {m.text}
              </div>
            ))}
          </div>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message" />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
        }
