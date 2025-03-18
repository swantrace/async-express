$(document).ready(function () {
  $.ajax({
    url: "/ajax",
    type: "POST",
    data: {
      name: "John",
      age: 1,
    },
    success: function (response) {
      console.log(response);
    },
  });
});
