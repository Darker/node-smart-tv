const forwardEvents = require("../lib/events/forwardEvents");
const events = require("events");


const a = new events();
const b = new events();

b.on("a.event", () => { console.log("a.event!"); });
b.on("a.event2", () => { console.log("a.event2!"); });
forwardEvents(a, { event: "a.event", event2:"a.event2" }, b);

a.emit("event");
a.emit("event2");
a.emit("event");