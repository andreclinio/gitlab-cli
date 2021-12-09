import { Moment } from "moment";

export class Holder<T> {

  protected data: T;

  constructor(data: T) {
    this.data = data;
  }

  public dayOf(moment: Moment): string {
    if (!moment) return "?";
    return `${moment.format("DD/MM/YYYY")}`;
  }
}

