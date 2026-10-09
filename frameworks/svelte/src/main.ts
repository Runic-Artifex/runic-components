import { mount } from "svelte";
import "@fontsource-variable/geist";
import "@fontsource/cormorant/400.css";
import "./demo.css";
import App from "./App.svelte";
mount(App, { target: document.getElementById("app")! });
