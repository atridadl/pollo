import { EventEmitter } from "events";
import "dotenv/config";

let emitter: EventEmitter;

declare global {
  var __emitter: EventEmitter | undefined;
}

if (process.env.NODE_ENV === "production") {
  emitter = new EventEmitter();
} else {
  if (!global.__emitter) {
    global.__emitter = new EventEmitter();
  }
  emitter = global.__emitter;
}

emitter.on("nodes", async (message: string) => {
  console.log(`RECEIVED ${message} EVENT!`);
  emitter.emit(message);
});

export { emitter };
