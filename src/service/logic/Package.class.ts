import { PackageFile } from './PackageFile.class';
import { PackageInfo } from './PackageInfo.class';

export class Package {
    constructor(
        private readonly packageInfo: PackageInfo,
        private readonly packageFiles: PackageFile[]
    ) {}

    toString(): string {
        const files = this.packageFiles
            .map((f) => `     * ${f.toString()}`)
            .join('\n');
        return `${this.packageInfo.toString()}\n${files}`;
    }
}
