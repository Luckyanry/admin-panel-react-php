<?php
session_start();

$_POST = json_decode(file_get_contents("php://input"), true);

// отримуємо пароль
$password = $_POST["password"];

// отримуємо дані які знаходяться в settings.json

if ($password) {
  $settings = json_decode(file_get_contents("./settings.json"), true);

  if ($password == $settings["password"]) {
    $_SESSION["auth"] = true;
    echo json_encode(array("auth" => true));
  } else {
    echo json_encode(array("auth" => false));
  }
} else {
  header("HTTP/1.0 400 Bad Request");
}
