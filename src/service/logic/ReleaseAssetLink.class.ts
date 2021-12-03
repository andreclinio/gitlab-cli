import { JsonReleaseAssetLink } from "../json-data";
import { Holder } from "./Holder.class";

export class ReleaseAssetLink extends Holder<JsonReleaseAssetLink> {
    constructor(link: JsonReleaseAssetLink) {
        super(link);
    }
    get id(): number {
        return this.data.id;
    }

    get name(): string {
        return this.data.name;
    }

    get link_type(): string {
        return this.data.link_type;
    }

    get url(): string {
        return this.data.url;
    }

    get external(): boolean {
        return this.data.external;
    }

}