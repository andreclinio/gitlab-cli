import moment from 'moment';
import { Moment } from 'moment';
import { JsonPackageInfo as JsonPackageInfo } from '../json-data';
import { Holder } from './Holder.class';

export class PackageInfo extends Holder<JsonPackageInfo> {
    constructor(packge: JsonPackageInfo) {
        super(packge);
    }

    get id(): number {
        return this.data.id;
    }

    get name(): string {
        return this.data.name;
    }

    get version(): string {
        return this.data.version;
    }

    get package_type(): string {
        return this.data.package_type;
    }

    get created_at(): Moment {
        return moment(this.data.created_at);
    }

    toString(): string {
        const name = `${this.name} ${this.version} (${this.package_type})`;
        return `[Package #${this.id}] ${name}`;
    }
}
