export default class Item{
    static processApiResponse(response) {
        return response.map(Item.fromRaw);
    }

    static fromRaw(rawItem) {
        return new Item(rawItem);
    }

    static compareIds(lhs, rhs) {
        return lhs.id - rhs.id;
    }

    static binarySearchCompare(item, id) {
        return item.id - id;
    }

    static mapDomElement(item) {
        return item.getDomElement();
    }

    constructor(rawItem) {
        Object.assign(this, rawItem);
    }

    compareByType(other) {
        if (this.object === other.object)
            return 0;

        if (this.object === "radical")
            return -1;

        if (other.object === "radical")
            return 1;

        if (this.object === "kanji")
            return -1;

        return 1;
    }

    setTextOnDomElement(dom) {
        if (this.data.characters !== null) {
            dom.text(this.data.characters);
            return;
        }

        let img = $("<img />");
        img.attr("src", this.characterImageUrl);
        img.css("filter", "invert(1)");
        dom.append(img);
    }

    getDomElement() {
        let li = $("<li />");
        let a = $("<a />");
        li.addClass(this.domClassName);
        li.attr(this.domAttrs);
        li.append(a);
        this.setTextOnDomElement(a);
        a.attr({
            href: this.data.document_url,
            lang: "ja"
        });

        return li;
    }

    get characterImageUrl() {
        return this.data.character_images.find(i => i.content_type === "image/svg+xml" && i.metadata.inline_styles).url;
    }

    get domClassName() {
        if (this.object === "radical")
            return "radicals";
        return this.object;
    }

    get primaryMeaning() {
        return this.data.meanings.find(m => m.primary).meaning;
    }

    get primaryReading() {
        return this.data.readings.find(r => r.primary).reading;
    }

    get meaningCorrectPercent() {
        return Math.round(this.meaningCorrectCount * 100 / this.meaningAttempts);
    }

    get meaningCorrectCount() {
        return this.review_statistics.meaning_correct;
    }

    get meaningAttempts() {
        return this.review_statistics.meaning_correct + this.review_statistics.meaning_incorrect;
    }

    get readingCorrectPercent() {
        return Math.round(this.readingCorrectCount * 100 / this.readingAttempts);
    }

    get readingCorrectCount() {
        return this.review_statistics.reading_correct;
    }

    get readingAttempts() {
        return this.review_statistics.reading_correct + this.review_statistics.reading_incorrect;
    }

    get domAttrs() {
        let res = {
            "data-en": this.primaryMeaning,
            "data-mc": this.meaningCorrectPercent,
        };

        if (!this.object.startsWith("r"))
            res = {
                ...res,
                "data-ja": this.primaryReading,
                "data-rc": this.readingCorrectPercent,
            };

        return res;
    }
}
