import Item from "./Item";

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

    static getItem(review) {
        return review.item;
    }

    static creationDate(review) {
        return review.createdAt;
    }

    static srsPrevFilter(srsClass) {
        return review => review.srsPrevName.includes(srsClass);
    }

    static srsNewFilter(srsClass) {
        return review => review.srsNewName.includes(srsClass);
    }

    static correctFilter() {
        return review => review.isCorrect;
    }

    static incorrectFilter() {
        return review => !review.isCorrect;
    }

    static itemTypeFilter(itemType) {
        return review => review.itemType === itemType;
    }

    constructor(rawReview) {
        Object.assign(this, rawReview);
    }

    associateItem(itemList) {
        this.item = itemList[this.itemId];
    }

    compare(other) {
        let typeCompare = this.item.compareByType(other.item);

        if (typeCompare !== 0) return typeCompare;

        let srsDiff = this.srsEndStage - other.srsEndStage;

        if (srsDiff !== 0) return srsDiff;

        return this.itemId - other.itemId;
    }

    get createdAt() {
        return new Date(this.data.created_at);
    }

    get itemId() {
        return this.data.subject_id;
    }

    get srsPrevName() {
        return this.data.starting_srs_stage_name.toLowerCase();
    }

    get srsNewName() {
        return this.data.ending_srs_stage_name.toLowerCase();
    }

    get srsEndStage() {
        return this.data.ending_srs_stage;
    }

    get incorrectMeaningAnswers() {
        return this.data.incorrect_meaning_answers;
    }

    get incorrectReadingAnswers() {
        return this.data.incorrect_reading_answers;
    }

    get isCorrect() {
        return (
            this.incorrectMeaningAnswers + this.incorrectReadingAnswers === 0
        );
    }

    get itemType() {
        return this.item.object.toLowerCase();
    }
}
