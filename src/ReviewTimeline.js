import Review from "./Review";
import Item from "./Item";
import timelineStructure from "./ReviewTimelineStructure.html";
import { ITEM_TYPES } from "./utils";

export default class ReviewTimeline {
    domElement = null;
    reviews = [];
    interval = d3.timeHour.every(4);

    lastUpdate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    itemConfig = {
        wk_items: {
            options: {
                review_statistics: true
            },
            filters: {
                srs: {
                    value: "lock",
                    invert: true
                }
            }
        }
    };

    reviewConfig = {
        last_update: this.lastUpdate
    };

    get graphWidth() {
        return $(this.domElement).width();
    }

    graphHeight = 100;

    get timeDomain() {
        return [
            this.interval(this.lastUpdate),
            this.interval(this.interval.offset(new Date()))
        ];
    }

    constructor(wkof) {
        this.domElement = $.parseHTML(timelineStructure)[0];

        wkof.ready("document, ItemData, Apiv2")
            .then(() =>
                Promise.all([
                    wkof.Apiv2.fetch_endpoint(
                        "reviews",
                        this.reviewConfig
                    ).then(Review.processApiResponse),
                    wkof.ItemData.get_items(this.itemConfig)
                        .then(Item.processApiResponse)
                        .then(items =>
                            wkof.ItemData.get_index(items, "subject_id")
                        )
                ])
            )
            .then(data => this.processData(...data))
            .then(this.initializeTimeline);
    }

    processData(reviews, itemIndex) {
        this.reviews = reviews;
        for (let review of this.reviews) review.associateItem(itemIndex);
    }

    initializeTimeline = () => {
        d3.select(this.domElement)
            .select("svg")
            .attr("transform", "scale(1, -1)");

        this.drawTimeline();
    };

    drawTimeline() {
        let timeScale = d3
            .scaleTime()
            .domain(this.timeDomain)
            .range([0, this.graphWidth]);

        let histogram = d3
            .histogram()
            .domain(timeScale.domain())
            .thresholds(timeScale.ticks(this.interval))
            .value(Review.creationDate);

        let bins = histogram(this.reviews);

        let yScale = d3
            .scaleLinear()
            .domain([0, d3.max(bins, b => b.length)])
            .range([0, this.graphHeight]);

        let barGroup = d3
            .select(this.domElement)
            .select("svg")
            .attr("width", this.graphWidth)
            .attr("height", this.graphHeight)
            .selectAll(".bar")
            .data(bins);

        barGroup.exit().remove();

        let newBars = barGroup
            .enter()
            .append("g")
            .classed("bar", true);

        for (let itemType of ITEM_TYPES)
            newBars.append("rect").classed(itemType, true);

        let update = newBars.merge(barGroup).datum(d =>
            ITEM_TYPES.reduce(
                (acc, type) => ({
                    ...acc,
                    [type]: d.filter(Review.itemTypeFilter(type)).length
                }),
                {
                    x: timeScale(d.x0),
                    width: timeScale(d.x1) - timeScale(d.x0)
                }
            )
        );

        let colors = {
            radical: "#00a1f1",
            kanji: "#f100a1",
            vocabulary: "#a100f1"
        };

        for (let itemType of ITEM_TYPES)
            update
                .select(`rect.${itemType}`)
                .attr("fill", colors[itemType])
                .attr("x", d => d.x)
                .attr("width", d => d.width)
                .attr("height", d => yScale(d[itemType]));

        update.select("rect.kanji").attr("y", d => yScale(d.radical));

        update
            .select("rect.vocabulary")
            .attr("y", d => yScale(d.radical + d.kanji));
    }
}
