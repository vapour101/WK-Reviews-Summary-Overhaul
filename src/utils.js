import { displayName } from "../package.json";
export const SRS_LEVELS = [
    "apprentice",
    "guru",
    "master",
    "enlightened",
    "burned"
];
export const ITEM_TYPES = ["radical", "kanji", "vocabulary"];

export const fetchWkof = () =>
    new Promise((resolve, reject) => {
        if (window.hasOwnProperty("wkof")) {
            return resolve(window.wkof);
        }

        return reject();
    });

export function promptWkofInstall() {
    if (
        confirm(
            displayName +
                " requires Wanikani Open Framework.\nDo you want to be forwarded to the installation instructions?"
        )
    )
        window.location.href =
            "https://community.wanikani.com/t/instructions-installing-wanikani-open-framework/28549";
}
