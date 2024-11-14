import ReactDOM from "react-dom";
import App from "./App";
import "./index.scss";
import { Provider } from "react-redux";
import { store } from "./shared/store/store";
import { enableMapSet } from "immer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

enableMapSet();
const queryClient = new QueryClient();

ReactDOM.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Provider>,
  document.getElementById("root")
);
