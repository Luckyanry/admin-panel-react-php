<?php
session_start();
if ($_SESSION["auth"] != true) {
  header("HTTP/1.0 403 Forbidden");
  die; // якщо виконується скрипт, код далі не відпрацьовує
}

// php не вміє працювати напряму з json-данними, тому їх завжди потрібно декодувати для обробки в php
$_POST = json_decode(file_get_contents("php://input"), true);
$newFile = "../../" . $_POST["name"] . ".html"; // "." - конкатенація в php

if (file_exists($newFile)) {
  header("HTTP/1.0 400 Bad Request");
} else {
  fopen($newFile, "w");
}
