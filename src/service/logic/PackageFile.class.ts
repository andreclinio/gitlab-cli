import moment from 'moment';
import { Moment } from 'moment';
import { JsonPackageFile } from '../json-data';
import { Logger } from '../../logger';
import { Holder } from './Holder.class';

export class PackageFile extends Holder<JsonPackageFile> {
    private readonly webUrl: string;

    constructor(packageFile: JsonPackageFile, prefixUrl: string) {
        super(packageFile);
        this.webUrl = `${prefixUrl}/-/package_files/${packageFile.id}/download`;
    }

    get id(): number {
        return this.data.id;
    }

    get size(): number {
        return this.data.size;
    }

    get file_name(): string {
        return this.data.file_name;
    }

    get web_url(): string {
        return this.webUrl;
    }

    get created_at(): Moment {
        return moment(this.data.created_at);
    }

    toString(): string {
        const name = `${this.file_name} (${(this.size / 1024.0).toFixed(2)} kb)`;
        return `[File #${this.id}] ${name} - ${Logger.dthr(this.created_at)} - ${Logger.toCyan(this.web_url)}`;
    }
}
