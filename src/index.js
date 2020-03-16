import {fetchWkof, promptWkofInstall} from "./utils";
import ReviewDashboard from "./ReviewDashboard";

fetchWkof()
    .then(wkof => new ReviewDashboard(wkof))
    .catch(promptWkofInstall);
