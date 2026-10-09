import { mount } from "svelte";
import "@fontsource-variable/geist";
import "@fontsource/cormorant/400.css";
import "./demo.css";
import NativeApp from "./NativeApp.svelte";
mount(NativeApp, { target: document.getElementById("app")! });
