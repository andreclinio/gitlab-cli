import { JsonReleaseAssets } from '../json-data';
import { Holder } from './Holder.class';
import { ReleaseAssetLink } from './ReleaseAssetLink.class';

export class ReleaseAsset extends Holder<JsonReleaseAssets> {
    constructor(assets: JsonReleaseAssets) {
        super(assets);
    }

    get links(): ReleaseAssetLink[] {
        const ls = this.data.links;
        const links = ls.map((l) => new ReleaseAssetLink(l));
        return links;
    }
}
