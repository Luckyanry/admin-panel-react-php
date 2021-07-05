import $ from "jquery";

function getPageList() {
  $("h1").remove();

  $.get(
    "./api",
    (data) => {
      data.forEach((el) => {
        $("body").append(`<h1>${el}</h1>`);
      });
    },
    "JSON"
  );
}

getPageList();

$("button").click(() => {
  $.post(
    "./api/createNewPage.php",
    {
      name: $("input").val(),
    },
    () => {
      getPageList();
    }
  ).fail(() => {
    alert("The page already exists!");
  });
});
