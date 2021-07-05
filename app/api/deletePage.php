<?php
$_POST = json_decode(file_get_contents("php://input"), true);

$file = "../../" . $_POST["name"];

if (file_exists($file)) {
  unlink($file); // спеціальна змінна яка в php видаляє вказаний файл
} else {
  header("HTTP/1.0 404 Not Found");
}