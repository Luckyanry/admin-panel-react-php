<?php
session_start();
if ($_SESSION["auth"] != true) {
  header("HTTP/1.0 403 Forbidden");
  die; // якщо виконується скрипт, код далі не відпрацьовує
}

$file = "../../temp-page-dont-change.html"; // захардкодилиб щоб ніхто не змінив копію нашої головної сторінки

if (file_exists($file)) {
  unlink($file); // спеціальна змінна яка в php видаляє вказаний файл
} else {
  header("HTTP/1.0 404 Not Found");
}
