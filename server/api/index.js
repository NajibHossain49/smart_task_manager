import server from "../server.js";

export const config = {
  api: {
    bodyParser: false, // Important for streams if needed, but we handle json manually in server.js
  },
};

export default server;
