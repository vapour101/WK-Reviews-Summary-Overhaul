import {SRS_LEVELS, ITEM_TYPES} from "./utils";
import Review from "./Review";
import Item from "./Item";

export default class ReviewDashboard {
    reviews = [];

    constructor(wkof) {
        wkof.include("Apiv2, ItemData");
        let endpointsReady = wkof.ready("Apiv2, ItemData");

        let reviewsFetched = endpointsReady
            .then(() => this.fetchReviews(wkof));

        let dataLoaded = endpointsReady
            .then(() => this.fetchItems(wkof, reviewsFetched));

        let documentReady = wkof.ready("document");

        let documentSetup = Promise.all([documentReady, reviewsFetched])
            .then(this.setupDocument);

        Promise.all([documentSetup, dataLoaded])
            .then(this.displayData)
            .catch(err => console.log(err));
    }

    setupDocument = () => {
        $("#correct>div>ul, #incorrect>div>ul").empty();

        $("#review-stats>.pure-u-1-4").removeClass().addClass("pure-u-1-5");
        this.setTotals();
    };

    setTotals() {
        let correct = this.reviews.filter(Review.correctFilter()).length;

        this.createOverallTotalHeader(correct, this.reviews.length);

        this.setOverallPercentage(correct);
        this.setTotal("correct", correct);
        this.setTotal("incorrect", this.reviews.length - correct);

        for (let srs of SRS_LEVELS) {
            this.countSubtotal(srs);
        }

        this.setMissedBurnsTotal();
    }

    setOverallPercentage(correct) {
        let percentage = Math.round(correct * 100 / this.reviews.length);
        $("#review-stats-answered-correctly>.review-stats-value").text(percentage);
    }

    countSubtotal(srsClass) {
        let filteredReviews = this.reviews.filter(Review.srsNewFilter(srsClass));
        let correct = filteredReviews.filter(Review.correctFilter()).length;

        this.setSubtotal("correct", srsClass, correct);
        this.setSubtotal("incorrect", srsClass, filteredReviews.length - correct);
    }

    setSubtotal(id, srsClass, total) {
        let sel = `#${id} .${srsClass}`;
        $(`${sel}>h3>span>strong`).text(total);

        if (total === 0)
            $(sel).removeClass("active");
        else
            $(sel).addClass("active");
    }

    setMissedBurnsTotal() {
        let missedReviews = this.getMissedBurnReviews();

        if (missedReviews.length === 0)
            return;

        $("#incorrect>h2").after(`<div class="burned active"><h3><span><strong title="Items in this group">${missedReviews.length}</strong> Missed Burns</span></h3><ul></ul></div>`);
    }

    insertMissedBurnItems() {
        $("#incorrect .burned>ul").append(
            this.getMissedBurnReviews()
                .map(Review.getItem)
                .map(Item.mapDomElement)
        );
    }

    getMissedBurnReviews() {
        return this.reviews
            .filter(Review.incorrectFilter())
            .filter(Review.srsPrevFilter("enlightened"));
    }

    setTotal(id, total) {
        $(`#${id}>h2>strong`).text(total);
        let el = $(`#${id}`);

        if (total === 0) {
            el.parent().css("display", "none");
            el.removeAttr("style");
        } else {
            el.parent().removeAttr("style");
            el.css("display", "block");
        }
    }

    createOverallTotalHeader(correct, total) {
        let style = {
            "background-color": "#252A3A",
            color: "#FFFFFF",
        };

        let header = $(
            `<div class="pure-u-1-5">
                 <div id="review-stats-total">
                     <div class="review-stats-value">${correct}</div>
                     <div class="review-stats-total">out of <span>${total}</span></div>
                     <div class="review-stats-type">Total</div>
                 </div>
             </div>`);
        header.children().css(style);

        $("#review-stats").append(header);
    }

    setGrandTotal(itemType) {
        let filtered = this.reviews.filter(Review.itemTypeFilter(itemType));
        let correct = filtered.filter(Review.correctFilter()).length;

        if (itemType === "radical")
            itemType += "s";

        $(`#review-stats-${itemType}>.review-stats-value`).text(correct);
        $(`#review-stats-${itemType}>.review-stats-total>span`).text(filtered.length);
    }

    displayData = () => {
        for (let type of ITEM_TYPES)
            this.setGrandTotal(type);

        for (let srs of SRS_LEVELS)
            this.insertItems(srs);

        this.insertMissedBurnItems();
        this.createHoverElements();
    };

    createHoverElements() {
        let sel = SRS_LEVELS.map(l => `.${l}>ul>li`).join(", ");
        $(sel).hover(function() {
            let div = $("<div />", {class: "hover"}).appendTo(this);
            let ul = $("<ul />").appendTo(div);

            for (let i of ["en", "ja", "mc", "rc"])
                $("<li />", {text: $(this).data(i)}).appendTo(ul);

            let side_class = "right-side";
            let right = "0";

            if ($(window).width() - $(this).offset().left > 200) {
                side_class = "left-side";
                right = "auto";
            }

            let arrow_class = "up-arrow";
            let top = $(this).height() + 4;

            if ($(window).height() - $(this).offset().top < 100) {
                arrow_class = "down-arrow";
                top = -1 * (div.height() + top / 2);
            }

            div.css({
                top, right
            });
            div.addClass(arrow_class);
            div.addClass(side_class);
        }, function() {
            $(this).children("div").remove();
        });
    }

    insertItems(srsClass) {
        let srsReviews = this.reviews.filter(Review.srsNewFilter(srsClass));

        $(`#correct .${srsClass}>ul`).append(
            srsReviews.filter(Review.correctFilter())
                .map(Review.getItem)
                .map(Item.mapDomElement)
        );

        $(`#incorrect .${srsClass}>ul`).append(
            srsReviews.filter(Review.incorrectFilter())
                .map(Review.getItem)
                .map(Item.mapDomElement)
        );
    }

    getMidnightToday() {
        let res = new Date();
        res.setHours(0, 0, 0, 0);
        return res;
    }

    fetchReviews(wkof) {
        let options = {
            last_update: this.getMidnightToday(),
        };

        return wkof.Apiv2.fetch_endpoint("reviews", options)
            .then(Review.processApiResponse)
            .then(reviews => this.reviews = reviews);
    }

    fetchItems(wkof, reviewsPromise){
        let config = {
            wk_items: {
                options: {
                    review_statistics: true,
                },
                filters: {
                    //level: "1..+0",
                    srs: {
                        value: "lock",
                        invert: true,
                    },
                },
            },
        };

        let itemsFetch = wkof.ItemData.get_items(config);

        return Promise.all([itemsFetch, reviewsPromise])
            .then(vals => vals[0])
            .then(Item.processApiResponse)
            .then(items => wkof.ItemData.get_index(items, "subject_id"))
            .then(this.associateItemsWithReviews)
            .then(() => this.reviews.sort(Review.compare));
    }

    associateItemsWithReviews = (itemList) => {
        for (let review of this.reviews)
            review.associateItem(itemList);
    };
}
