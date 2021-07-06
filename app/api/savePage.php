<?php
$_POST = json_decode(file_get_contents("php://input"), true);

$file = $_POST["pageName"];
$newHTML = $_POST["html"];

// перевіряємо чи існує папка, якщо ні - створюємо її
if(!is_dir("../backups/")) {
  mkdir("../backups/");
}

// Якщо файл існує - декодуємо і записуємо в змінну, якщо ні - записуємо []
$backups = json_decode(file_get_contents("../backups/backups.json"));
if(!is_array($backups)) {
  $backups = [];
}

if ($newHTML && $file) {
  // uniqid - створює унікальне id
  $backupFN = uniqid() . ".html";

  // copy(що, куди) - робить копію обраного файла
  copy("../../" . $file, "../backups/" . $backupFN);

  // парший арг - звідки брати, другий - генеруємо елемент масива який потрібно туди записати
  array_push($backups, ["page" => $file, "file" => $backupFN, "time" => date("H:i:s d.m.y")]);

  // кодуємо файл в формат json, який будемо віддавати клієнту
  file_put_contents("../backups/backups.json", json_encode($backups));
  file_put_contents("../../" . $file, $newHTML);
} else {
  header("HTTP/1.0 400 Bad Request");
}