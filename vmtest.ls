require! {vm}

hoge = 1

console.log (42).toString!

script = new vm.Script '''
  console.log(a)
  console.log(a.poyo)
  console.log((42).toString());
  Number.prototype.toString = function(){return 'hoge'}
  a.poyo = 2
'''

a = poyo: 1

context = new vm.create-context global with {a}

script.run-in-context context

console.log a
console.log a.poyo

