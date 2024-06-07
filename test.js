Array.prototype.testMethod1 = 1;
Array.prototype.testMethod2 = function () {};
Array.prototype.forEach2 = function (callback) {
  for (var index in this) {
    console.log("index", index);

  }
};

console.log(Array.prototype);
var courses = ["cdkcm", "cdcbs"];

courses.forEach2(function (course, inde, array) {
  console.log(course, inde, array);
});
