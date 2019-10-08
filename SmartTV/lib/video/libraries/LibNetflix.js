const MediaLibrary = require("../MediaLibrary");
const fetch = require("node-fetch");
const NetflixVideo = require("../videotypes/NetflixVideo");

/**
 * @typedef {Object} JustWatchEntry - description
 * @property {string} jw_entity_id description
 * @property {number} id description
 * @property {string} title description
 * @property {string} full_path description
 * @property {Object} full_paths description
 * @property {string} full_paths.SHOW_DETAIL_OVERVIEW description
 * @property {string} poster description
 * @property {string} short_description description
 * @property {number} original_release_year description
 * @property {string} object_type description
 * @property {string} original_title description
 * @property {string} original_language description
 * @property {number} max_season_number description
 */
/**
 * @typedef {Object} JustWatchListing - description
 * @property {number} page_size description
 * @property {number} total_pages description
 * @property {number} total_results description
 * @property {JustWatchEntry[]} items description
 */

class LibNetflix extends MediaLibrary {
    constructor(uniqueID="netflix") {
        super(uniqueID);
        this.searchURL = "https://apis.justwatch.com/content/titles/en_GB/popular?body=";
        this.searchObject = {
            "age_certifications": [],
            "content_types": [],
            "genres": [],
            "languages": null,
            "min_price": null,
            "max_price": null,
            "monetization_types": ["ads", "buy", "flatrate", "free", "rent"],
            "presentation_types": [],
            "providers": ["nfx"],
            "release_year_from": null,
            "release_year_until": null,
            "scoring_filter_types": null,
            "timeline_type": null,
            "q": null,
            "sort_by": null,
            "sort_asc": null,
            "query": null,
            "page": 0,
            "page_size": 10
        };
    }
    get canPlayString() {
        return true;
    }
    get canSearch() {
        return true;
    }
    /**
     * Search for videos in a given resource. This search function should
     * never find same video twice.
     * 
     * @param {number} maxDuration if set, limits the duration of a search
     * @returns {Promise<MediaLibrary.VideosResult>}
     */
    async searchForVideos(maxDuration = Infinity, maxCount = Infinity) {
        const videos = [];
        const sleepTime = 500;
        const startTime = new Date().getTime();

        while (videos.length < maxCount) {
            const fullURL = this.searchURL + JSON.stringify(this.searchObject);
            console.log("Search videos at: ", fullURL);
            const result = await fetch(this.searchURL + JSON.stringify(this.searchObject));
            this.searchObject.page++;
            /** @type {JustWatchListing} **/
            const resultJSON = await result.json();

            for (const entry of resultJSON.items) {
                const video = new NetflixVideo(entry, this.uniqueId);
                if (this.addUnique(video)) {
                    videos.push(video);
                }
            }
            let now = new Date().getTime();
            if ((now + sleepTime + 100 - startTime) > maxDuration) {
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, sleepTime));
        }

        //console.log(await result.text());
        return { videos, end: false };
    }
}
module.exports = LibNetflix;