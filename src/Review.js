import Item from "./Item";
import bs from "binary-search";

export default class Review {
    static processApiResponse(response) {
        return response.data.map(Review.fromRaw);
    }

    static fromRaw(rawReview) {
        return new Review(rawReview);
    }

    static compare(lhs, rhs) {
        return lhs.compare(rhs);
    }

    constructor(rawReview) {
        Object.assign(this, rawReview);
    }

    associateItem(itemList) {
        this.item = itemList[bs(itemList, this.itemId, Item.binarySearchCompare)];
    }

    compare(other) {
        let typeCompare = this.item.compareByType(other.item);

        if (typeCompare !== 0)
            return typeCompare;

        let srsDiff = this.srsEndStage - other.srsEndStage;

        if (srsDiff !== 0)
            return srsDiff;

        return this.itemId - other.itemId;
    }

    get itemId() {
        return this.data.subject_id;
    }

    get srsEndStage() {
        return this.data.ending_srs_stage;
    }

}
