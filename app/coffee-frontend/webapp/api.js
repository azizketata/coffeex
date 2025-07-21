import axios from "axios";

const baseURL = "${ADD_YOUR_SERVICE_URL_HERE}";

const instance = axios.create({
  baseURL,
});

export default instance;
