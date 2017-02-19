class Foo {
  constructor() {
    console.log('Foo has been loaded.');
    this.bar = 42;
  }
}

module.exports = new Foo();
