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
}
