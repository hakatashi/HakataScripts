var a = new Set([1,2,1]);
var b = new Set([1,3,2]);

console.log(eqSet(a, b)); // true

function eqSet(as, bs) {
    if (as.size !== bs.size) return false;
    for (var a of as) {
      console.log(a);
      if (!bs.has(a)) return false;
    }
    return true;
}
