class EasyDate extends Date {
  get date() {
    return this.getDate();
  }
  set date(val) {
    this.setDate(val);
  }
}

const d = new EasyDate();
d.date++;

console.log(d);
